<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import { getData } from "@/lib/info.js";

const user = ref(null);
const router = useRouter();
const likedMovies = ref([]);
const categories = ref([]);
const movieDetail = ref(null);  // Added movieDetail as a ref

const categoryUrl = import.meta.env.VITE_CATEGORY_URL;
const baseTMDB = import.meta.env.VITE_BASE_KEY;
const apiKey = import.meta.env.VITE_API_KEY;

const checkUserPayload = () => {
  const payload = localStorage.getItem("payload");
  if (payload) {
    user.value = JSON.parse(payload);
  }
};

const getMediaType = async (movieId) => {
  try {
    const movieResponse = await fetch(
      `${baseTMDB}/movie/${movieId}?api_key=${apiKey}&language=en-US`
    );
    if (movieResponse.status === 200) {
      return "movie";
    } else if (movieResponse.status === 404) {
      console.warn(`Movie not found for ID: ${movieId}`);
    } else {
      console.error(`Unexpected status for movie: ${movieResponse.status}`);
    }

    const tvResponse = await fetch(
      `${baseTMDB}/tv/${movieId}?api_key=${apiKey}&language=en-US`
    );
    if (tvResponse.status === 200) {
      return "tv";
    } else if (tvResponse.status === 404) {
      console.warn(`TV show not found for ID: ${movieId}`);
    } else {
      console.error(`Unexpected status for TV: ${tvResponse.status}`);
    }
  } catch (error) {
    console.error(`Error determining media type for ID ${movieId}:`, error);
  }
  return null;
};

const getMyLike = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      const userId = token.id;
      const result = await getData(
        `${import.meta.env.VITE_BASE_URL}/users/likes`,
        userId
      );

      likedMovies.value = await Promise.all(
        result.data.map(async (movie) => {
          const movieId = movie.movieId;
          const mediaType = await getMediaType(movieId);

          if (!mediaType) {
            console.warn(`Media type not found for ID ${movieId}`);
            return {
              ...movie,
              title: "Unknown Title",
              description: "No description available",
              poster: "https://via.placeholder.com/300x450?text=No+Poster",
              mediaType: null,
            };
          }

          try {
            const tmdbResponse = await fetch(
              `${baseTMDB}/${mediaType}/${movieId}?api_key=${apiKey}&language=en-US`
            );
            if (!tmdbResponse.ok) {
              throw new Error(`Failed to fetch ${mediaType} details`);
            }
            const tmdbData = await tmdbResponse.json();

            return {
              ...movie,
              title: tmdbData.title || tmdbData.name,
              description: tmdbData.overview,
              poster: tmdbData.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Poster",
              mediaType,
              movieId: movieId,
            };
          } catch (error) {
            console.error(
              `Error fetching details for movie ID ${movieId}:`,
              error
            );
            return {
              ...movie,
              title: "Unknown Title",
              description: "No description available",
              poster: "https://via.placeholder.com/300x450?text=No+Poster",
              mediaType,
            };
          }
        })
      );
    }
  } catch (error) {
    console.error("Error fetching liked movies:", error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetch(categoryUrl);
    if (!response.ok) throw new Error("Failed to fetch categories");
    const data = await response.json();
    categories.value = data.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

const goToLogin = () => {
  router.push({ name: "Login" });
};

const goToRegister = () => {
  router.push({ name: "Register" });
};

const goToMediaDetail = async (mediaId) => {
  if (!mediaId) {
    console.error(
      `Missing mediaId parameter for goToMediaDetail: mediaId=${mediaId}`
    );
    return;
  }

  const mediaType = await getMediaType(mediaId);

  if (!mediaType) {
    console.error(`Unable to determine mediaType for ID: ${mediaId}`);
    return;
  }

  const routeName = mediaType === "movie" ? "MovieDetail" : "TvDetail";
  router.push({ name: routeName, params: { id: mediaId } });
};

onMounted(async () => {
  checkUserPayload();
  if (user.value) {
    await getMyLike();
  }
  fetchCategories();
});
</script>


<template>
  <div
    class="flex flex-col min-h-screen text-white bg-zinc-900"
    style="margin-top: 2rem"
  >
    <!-- Navbar -->
    <Navbar />

    <div class="flex flex-1 pt-16">
      <!-- Sidebar -->
      <Sidebar :categories="categories" />

      <!-- Main Content -->
      <main class="flex-1 p-6 ml-64">
        <div v-if="user">
          <!-- Movie Detail -->
          <div
            v-if="movieDetail"
            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
          >
            <div class="w-3/4 max-w-4xl p-6 rounded shadow-lg bg-zinc-800">
              <div class="flex">
                <!-- Movie Poster -->
                <img
                  :src="movieDetail.poster || 'https://via.placeholder.com/300x450?text=No+Poster'"
                  alt="Movie Poster"
                  class="w-1/3 h-auto mr-6 rounded-md"
                />
                <!-- Movie Details -->
                <div class="flex-1">
                  <h2 class="mb-4 text-2xl font-bold">{{ movieDetail.title }}</h2>
                  <p class="mb-4 text-gray-400">{{ movieDetail.overview }}</p>
                  <p class="text-sm text-gray-500">
                    <span class="font-bold text-gray-300">Release Date:</span>
                    {{ movieDetail.release_date }}
                  </p>
                  <p class="text-sm text-gray-500">
                    <span class="font-bold text-gray-300">Rating:</span>
                    {{ movieDetail.vote_average }}/10
                  </p>
                </div>
              </div>
              <!-- Close Button -->
              <button
                @click="movieDetail = null"
                class="px-4 py-2 mt-6 text-sm font-bold text-white bg-gray-700 rounded hover:bg-gray-600 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>

          <!-- Liked Movies -->
          <div v-else class="space-y-6">
            <h2 class="text-3xl font-bold text-center">Liked Movies</h2>
            <div
              v-if="likedMovies.length"
              class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              <div
                v-for="movie in likedMovies"
                :key="movie.id"
                class="p-4 transition duration-300 transform shadow bg-zinc-800 rounded-xl hover:shadow-lg hover:-translate-y-1"
              >
                <img
                  :src="movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'"
                  alt="Movie Poster"
                  class="object-cover w-full h-64 mb-4 rounded-md"
                />
                <h3 class="mb-2 text-lg font-bold text-center truncate">
                  {{ movie.title }}
                </h3>
                <p class="text-sm text-gray-400 truncate-3-lines">
                  {{ movie.description || "No description available" }}
                </p>
                <p class="mt-2 text-sm text-gray-500">
                  <span class="font-bold text-gray-300">Liked at:</span>
                  {{ new Date(movie.likedAt).toLocaleString() }}
                </p>
                <!-- View Details Button -->
                <button
                  @click="goToMediaDetail(movie.movieId)"
                  class="w-full py-2 mt-2 text-sm font-bold text-white duration-500 bg-red-600 rounded-xl hover:bg-red-900 focus:outline-none hover:shadow-[0_0_10px_5px_rgba(255,0,0,0.7)] transition"
                >
                  View Details
                </button>
              </div>
            </div>
            <div v-else class="text-center text-gray-400">
              You have not liked any movies yet.
            </div>
          </div>
        </div>

        <!-- User not logged in -->
        <div
          v-else
          class="flex flex-col items-center justify-center min-h-screen space-y-6"
        >
          <h2 class="text-3xl font-bold">
            Welcome to MOVIE<span class="text-red-500">HUB</span>
          </h2>
          <p class="text-gray-400">
            Please login or register to view liked movies.
          </p>
          <div class="flex justify-center space-x-4">
            <button
              @click="goToLogin"
              class="px-6 py-3 font-bold text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400"
            >
              Login
            </button>
            <button
              @click="goToRegister"
              class="px-6 py-3 font-bold text-white bg-gray-700 rounded hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-400"
            >
              Register
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* เพิ่มการตัดข้อความยาว */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
