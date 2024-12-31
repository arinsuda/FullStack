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
const movieDetail = ref(null);
const categoryUrl = import.meta.env.VITE_CATEGORY_URL;
const baseTMDB = import.meta.env.VITE_BASE_KEY;
const apiKey = import.meta.env.VITE_API_KEY;

const checkUserPayload = () => {
  const payload = localStorage.getItem("payload");
  if (payload) {
    user.value = JSON.parse(payload);
  }
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

      // ใช้ movieId เพื่อดึงรายละเอียดเพิ่มเติมจาก TMDB
      likedMovies.value = await Promise.all(
        result.data.map(async (movie) => {
          const movieId = movie.movieId;
          try {
            const tmdbResponse = await fetch(
              `${baseTMDB}/movie/${movieId}?api_key=${apiKey}&language=en-US`
            );
            const tmdbData = await tmdbResponse.json();

            return {
              ...movie,
              title: tmdbData.title,
              description: tmdbData.overview,
              poster: tmdbData.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Poster",
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

const goToMovieDetail = (movieId) => {
  router.push({ name: "MovieDetail", params: { id: movieId } });
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
        <div v-if="user" class="space-y-6">
          <h2 class="text-3xl font-bold text-center">Liked Movies</h2>
          <div
            v-if="likedMovies.length"
            class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <div
              v-for="movie in likedMovies"
              :key="movie.id"
              class="p-4 bg-zinc-800 rounded-xl shadow hover:shadow-lg transform transition duration-300 hover:-translate-y-1"
            >
              <img
                :src="
                  movie.poster ||
                  'https://via.placeholder.com/300x450?text=No+Poster'
                "
                alt="Movie Poster"
                class="w-full h-64 object-cover rounded-md mb-4"
              />
              <h3 class="mb-2 text-lg font-bold truncate text-center">
                {{ movie.title }}
              </h3>
              <p class="text-gray-400 text-sm truncate-3-lines">
                {{ movie.description || "No description available" }}
              </p>
              <p class="mt-2 text-sm text-gray-500">
                <span class="font-bold text-gray-300">Liked at:</span>
                {{ new Date(movie.likedAt).toLocaleString() }}
              </p>
              <!-- ปุ่มสำหรับดูรายละเอียด -->
              <!-- ปุ่มสำหรับไปหน้า MovieDetail -->
              <button
                @click="goToMovieDetail(movie.movieId)"
                class="w-full mt-2 py-2 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none"
              >
                View Details
              </button>
            </div>
          </div>
          <div v-else class="text-center text-gray-400">
            You have not liked any movies yet.
          </div>
        </div>

        <!-- Movie Detail -->
        <div
          v-if="movieDetail"
          class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
        >
          <div class="bg-zinc-800 p-6 rounded shadow-lg w-3/4 max-w-4xl">
            <div class="flex">
              <!-- Movie Poster -->
              <img
                :src="movieDetail.poster"
                alt="Movie Poster"
                class="w-1/3 h-auto rounded-md mr-6"
              />
              <!-- Movie Details -->
              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-4">{{ movieDetail.title }}</h2>
                <p class="text-gray-400 mb-4">{{ movieDetail.overview }}</p>
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
              class="mt-6 py-2 px-4 text-sm font-bold text-white bg-gray-700 rounded hover:bg-gray-600 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>

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
