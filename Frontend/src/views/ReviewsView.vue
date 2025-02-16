<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import { getData } from "@/lib/info.js";

const user = ref(null);
const router = useRouter();
const userReviews = ref([]);
const categories = ref([]);
const baseTMDB = import.meta.env.VITE_BASE_KEY;
const apiKey = import.meta.env.VITE_API_KEY;
const categoryUrl = import.meta.env.VITE_CATEGORY_URL;

const checkUserPayload = () => {
  const payload = localStorage.getItem("payload");
  if (payload) {
    user.value = JSON.parse(payload);
  }
};

const getMediaType = async (movieId) => {
  try {
    // ลองค้นหาในฐานข้อมูลของ Movie
    const movieResponse = await fetch(
      `${baseTMDB}/movie/${movieId}?api_key=${apiKey}&language=en-US`
    );
    if (movieResponse.ok) {
      return "movie";
    }

    // หากไม่เจอ ลองค้นหาในฐานข้อมูลของ TV
    const tvResponse = await fetch(
      `${baseTMDB}/tv/${movieId}?api_key=${apiKey}&language=en-US`
    );
    if (tvResponse.ok) {
      return "tv";
    }
  } catch (error) {
    console.error(`Error determining media type for ID ${movieId}:`, error);
  }
  return null; // หากไม่พบข้อมูล
};

const getMyReviews = async () => {
  try {
    const payload = JSON.parse(localStorage.getItem("payload"));
    if (payload && payload.userId) {
      const userId = payload.userId;
      const result = await getData(
        `${import.meta.env.VITE_BASE_URL}/api/users/${userId}/reviews`,
        userId
      );

      // ใช้ movieId เพื่อดึงรายละเอียดเพิ่มเติมจาก TMDB
      userReviews.value = await Promise.all(
        result.data.map(async (review) => {
          try {
            const mediaType = await getMediaType(review.movieId);
            if (!mediaType) {
              throw new Error(`Media type not found for ID ${review.movieId}`);
            }

            const tmdbResponse = await fetch(
              `${baseTMDB}/${mediaType}/${review.movieId}?api_key=${apiKey}&language=en-US`
            );
            const tmdbData = await tmdbResponse.json();

            return {
              ...review,
              poster: tmdbData.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Poster",
              movieTitle: tmdbData.title || tmdbData.name || review.movieTitle,
            };
          } catch (error) {
            console.error(`Error fetching details for movie ID ${review.movieId}:`, error);
            return {
              ...review,
              poster: "https://via.placeholder.com/300x450?text=No+Poster",
            };
          }
        })
      );
    }
  } catch (error) {
    console.error("Error fetching user reviews:", error);
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

onMounted(async () => {
  checkUserPayload();
  if (user.value) {
    await getMyReviews();
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
          <h2 class="text-3xl font-bold text-center">My Reviews</h2>
          <div
            v-if="userReviews.length"
            class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <div
              v-for="review in userReviews"
              :key="review.id"
              class="flex flex-col overflow-hidden shadow-lg bg-zinc-800 rounded-xl"
            >
              <img
                :src="review.poster || 'https://via.placeholder.com/300x450?text=No+Poster'"
                alt="Movie Poster"
                class="object-cover w-full h-64"
              />
              <div class="flex flex-col justify-between flex-grow p-4">
                <h3 class="mb-2 text-lg font-bold truncate">
                  {{ review.movieTitle }}
                </h3>
                <p class="text-sm text-gray-400 truncate">
                  Rating: <span class="font-bold text-yellow-400">{{ review.rating }}/10</span>
                </p>
                <p class="mt-2 text-sm text-gray-400 truncate-3-lines">
                  {{ review.comment || "No review provided." }}
                </p>
                <p class="mt-4 text-xs text-gray-500">
                  Reviewed on: {{ new Date(review.createdAt).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-400">
            You have not submitted any reviews yet.
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
            Please login or register to view your reviews.
          </p>
          <div class="flex justify-center space-x-4">
            <button
              @click="goToLogin"
              class="px-6 py-3 font-bold text-white duration-500 bg-red-500 rounded-xl hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400"
            >
              Login
            </button>
            <button
              @click="goToRegister"
              class="px-6 py-3 font-bold text-white duration-500 bg-gray-700 rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-400"
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
