<script setup>
  import { ref, onMounted } from "vue"
  import { useRouter } from "vue-router"
  import Navbar from "@/components/Navbar.vue"
  import Sidebar from "@/components/Sidebar.vue"
  import { getData } from "@/lib/info.js"

  const user = ref(null)
  const router = useRouter()
  const watchlistMovies = ref([])
  const categories = ref([])
  const movieDetail = ref(null) // เพิ่ม movieDetail
  const baseTMDB = import.meta.env.VITE_BASE_KEY
  const apiKey = import.meta.env.VITE_API_KEY
  const categoryUrl = import.meta.env.VITE_CATEGORY_URL

  const checkUserPayload = () => {
    const payload = localStorage.getItem("payload")
    if (payload) {
      user.value = JSON.parse(payload)
    }
  }

  const getMediaType = async movieId => {
    try {
      const movieResponse = await fetch(
        `${baseTMDB}/movie/${movieId}?api_key=${apiKey}&language=en-US`
      )
      if (movieResponse.ok) return "movie"

      const tvResponse = await fetch(
        `${baseTMDB}/tv/${movieId}?api_key=${apiKey}&language=en-US`
      )
      if (tvResponse.ok) return "tv"
    } catch (error) {
      console.error(`Error determining media type for ID ${movieId}:`, error)
    }
    return null
  }

  const getMyWatchlist = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"))
      if (token) {
        const userId = token.id
        const result = await getData(
          `${import.meta.env.VITE_BASE_URL}/users/watchlists`,
          userId
        )

        watchlistMovies.value = await Promise.all(
          result.data.map(async movie => {
            const movieId = movie.movieId
            try {
              const mediaType = await getMediaType(movieId)
              if (!mediaType)
                throw new Error(`Media type not found for ID ${movieId}`)

              const tmdbResponse = await fetch(
                `${baseTMDB}/${mediaType}/${movieId}?api_key=${apiKey}&language=en-US`
              )
              const tmdbData = await tmdbResponse.json()

              return {
                ...movie,
                title: tmdbData.title || tmdbData.name,
                description: tmdbData.overview,
                poster: tmdbData.poster_path
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                  : "https://via.placeholder.com/300x450?text=No+Poster",
                mediaType,
              }
            } catch (error) {
              console.error(
                `Error fetching details for movie ID ${movieId}:`,
                error
              )
              return {
                ...movie,
                title: "Unknown Title",
                description: "No description available",
                poster: "https://via.placeholder.com/300x450?text=No+Poster",
              }
            }
          })
        )
      }
    } catch (error) {
      console.error("Error fetching watchlist movies:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(categoryUrl)
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      categories.value = data.sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName)
      )
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const goToMediaDetail = async mediaId => {
    const mediaType = await getMediaType(mediaId)
    if (!mediaType) {
      console.error(`Unable to determine media type for ID: ${mediaId}`)
      return
    }

    try {
      const response = await fetch(
        `${baseTMDB}/${mediaType}/${mediaId}?api_key=${apiKey}&language=en-US`
      )
      const data = await response.json()
      movieDetail.value = {
        title: data.title || data.name,
        overview: data.overview,
        release_date: data.release_date || data.first_air_date,
        vote_average: data.vote_average,
        poster: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : "https://via.placeholder.com/300x450?text=No+Poster",
      }
    } catch (error) {
      console.error("Error fetching media details:", error)
    }
  }

  const toggleMovieStatus = async movie => {
    try {
      const token = JSON.parse(localStorage.getItem("token"))
      if (!token) throw new Error("User not authenticated")

      // กำหนดสถานะใหม่โดยสลับระหว่าง TO_WATCH และ WATCHED
      const newStatus = movie.status === "TO_WATCH" ? "WATCHED" : "TO_WATCH"

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/movies/${
          movie.movieId
        }/watchlists`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) throw new Error("Failed to update movie status")
      const updatedMovie = await response.json()

      // อัปเดตสถานะใน watchlistMovies
      const movieIndex = watchlistMovies.value.findIndex(
        m => m.movieId === movie.movieId
      )
      if (movieIndex !== -1) {
        watchlistMovies.value[movieIndex].status = updatedMovie.data.status
      }
    } catch (error) {
      console.error("Error toggling movie status:", error)
    }
  }

  onMounted(async () => {
    checkUserPayload()
    if (user.value) {
      await getMyWatchlist()
    }
    fetchCategories()
  })
</script>

<template>
  <div
    class="flex flex-col min-h-screen text-white bg-zinc-900"
    style="margin-top: 2rem"
  >
    <Navbar />
    <div class="flex flex-1 pt-16">
      <Sidebar :categories="categories" />
      <main class="flex-1 p-6 ml-64 space-y-8">
        <section v-if="user" class="space-y-6">
          <h2 class="text-3xl font-bold text-center text-gray-200">
            My Watchlist
          </h2>
          <div
            v-if="watchlistMovies.length"
            class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <div
              v-for="movie in watchlistMovies"
              :key="movie.id"
              class="p-4 transition duration-300 transform rounded-lg shadow-lg bg-zinc-800 hover:scale-105"
            >
              <img
                :src="movie.poster"
                alt="Poster"
                class="object-cover w-full h-64 mb-4 rounded-md animate-fade-in"
                loading="lazy"
              />
              <h3
                class="mb-2 text-lg font-bold text-center truncate animate-slide-in"
              >
                {{ movie.title }}
              </h3>
              <div class="flex flex-col items-center space-y-2">
                <button
                  @click="toggleMovieStatus(movie)"
                  class="w-2/3 py-2 text-sm font-semibold text-white duration-300 rounded-2xl glow-effect"
                  :class="
                    movie.status === 'TO_WATCH'
                      ? 'bg-zinc-700 hover:bg-zinc-900'
                      : 'bg-amber-500 hover:bg-amber-700'
                  "
                >
                  {{ movie.status === "TO_WATCH" ? "TO WATCH" : "WATCHED" }}
                </button>
                <button
                  @click="goToMediaDetail(movie.movieId)"
                  class="w-full py-2 text-sm font-semibold text-white bg-red-600 rounded-2xl hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 glow-effect"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-center text-gray-500">
            Your watchlist is empty.
          </p>
        </section>

        <!-- Modal -->
        <div
          v-if="movieDetail"
          class="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black bg-opacity-80 animate-fade-in"
        >
          <div
            class="relative w-full max-w-4xl p-8 overflow-hidden border border-gray-700 shadow-2xl bg-zinc-800 rounded-xl"
          >
            <!-- Close Button -->
            <button
              @click="movieDetail = null"
              class="absolute p-2 text-gray-300 transition-transform duration-200 bg-gray-700 rounded-full top-4 right-4 hover:scale-110 hover:bg-gray-600 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <!-- Modal Content -->
            <div class="flex flex-col lg:flex-row">
              <!-- Poster -->
              <img
                :src="movieDetail.poster"
                alt="Poster"
                class="w-full h-auto rounded-lg shadow-lg lg:w-1/3"
              />
              <!-- Details -->
              <div class="flex-1 mt-6 lg:mt-0 lg:ml-6">
                <h2 class="mb-4 text-4xl font-extrabold text-gray-200">
                  {{ movieDetail.title }}
                </h2>
                <p class="mb-6 text-lg leading-relaxed text-gray-300">
                  {{ movieDetail.overview }}
                </p>
                <div class="space-y-3 text-sm text-gray-400">
                  <p>
                    <span class="font-medium text-gray-200">Release Date:</span>
                    {{ movieDetail.release_date }}
                  </p>
                  <p>
                    <span class="font-medium text-gray-200">Rating:</span>
                    {{ movieDetail.vote_average }}/10
                  </p>
                </div>
                <button
                  @click="movieDetail = null"
                  class="px-6 py-2 mt-8 text-sm font-semibold text-white transition-all bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg focus:ring-2 focus:ring-red-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
  }

  .animate-slide-in {
    animation: slide-in 0.5s ease-in-out;
  }

  .glow-effect:hover {
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 0, 0, 0.5);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
  }
</style>
