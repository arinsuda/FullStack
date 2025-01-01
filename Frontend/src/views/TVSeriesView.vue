<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // เพิ่ม useRouter
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';

const apiKey = import.meta.env.VITE_API_KEY;
const baseUrl = 'https://api.themoviedb.org/3';
const baseImageUrl = 'https://image.tmdb.org/t/p/w500';
const categoryUrl = import.meta.env.VITE_CATEGORY_URL;

const movies = ref([]);
const categories = ref([]);
const route = useRoute();
const router = useRouter(); // ใช้ router
const categoryId = ref(route.params.id);
const loading = ref(false);
const errorMessage = ref('');

const fetchCategories = async () => {
  try {
    const response = await fetch(categoryUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    categories.value = data.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    errorMessage.value = 'Unable to load categories.';
  }
};

const fetchMovies = async () => {
  loading.value = true;
  errorMessage.value = ''; // Clear error before fetching
  try {
    const response = await fetch(
      `${baseUrl}/tv/popular?api_key=${apiKey}&language=en-US`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }
    const data = await response.json();
    movies.value = data.results || [];
  } catch (error) {
    console.error('Error fetching movies:', error);
    errorMessage.value = 'Unable to load movies.';
  } finally {
    loading.value = false;
  }
};

// เพิ่มฟังก์ชัน navigateToTvDetail
const navigateToTvDetail = (tvId) => {
  router.push({ name: 'TvDetail', params: { id: tvId } });
};

watch(
  () => route.params.id,
  (newId) => {
    categoryId.value = newId;
    fetchMovies();
  }
);

onMounted(() => {
  fetchCategories();
  fetchMovies();
});
</script>

<template>
  <div class="min-h-screen text-white bg-zinc-900">
    <!-- Navbar -->
    <Navbar />

    <div class="flex pt-16">
      <!-- Sidebar -->
      <Sidebar :categories="categories" />

      <!-- Main Content -->
      <main class="flex-1 p-6 ml-64" style="margin-top: 2rem;">
        <!-- Header -->
        <h1 class="mb-6 text-3xl font-bold text-center text-red-500 animate-fade-in">
          TV Series
        </h1>

        <!-- Popular TV Series Section -->
        <section>
          <h2 class="mb-6 text-2xl font-semibold text-center text-white">
            Popular TV Series
          </h2>
          <div class="relative h-1 max-w-xs mx-auto mb-4 bg-red-500 rounded-full"></div>
          <ul
            class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 animate-fade-in"
          >
            <li
              v-for="movie in movies"
              :key="movie.id"
              class="p-4 transition-transform transform rounded-lg cursor-pointer bg-zinc-800 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
              @click="navigateToTvDetail(movie.id)" 
            >
              <img
                :src="
                  movie.poster_path
                    ? baseImageUrl + movie.poster_path
                    : '/placeholder-image.jpg'
                "
                :alt="movie.name || 'No Title'"
                class="mb-2 transition-opacity duration-300 rounded-lg hover:opacity-90"
              />
              <h3 class="text-lg font-semibold text-center truncate">
                {{ movie.name || 'Untitled' }}
              </h3>
              <p class="mt-2 text-sm text-center text-gray-400">
                {{ movie.first_air_date || 'Unknown release date' }}
              </p>
            </li>
          </ul>
        </section>

        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <p class="text-gray-400 animate-pulse">Loading...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="text-center">
          <p class="text-red-500 animate-shake">{{ errorMessage }}</p>
        </div>

        <!-- No Movies Found -->
        <div v-else class="text-center">
          <p class="text-gray-400">No TV series found.</p>
        </div>
      </main>
    </div>
  </div>
</template>
