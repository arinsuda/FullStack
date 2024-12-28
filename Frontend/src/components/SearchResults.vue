<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';

const apiKey = import.meta.env.VITE_API_KEY;
const baseUrl = import.meta.env.VITE_BASE_KEY;
const searchResults = ref([]);
const route = useRoute();
const loading = ref(false);
const errorMessage = ref('');
const categories = ref([]);
const categoryUrl = import.meta.env.VITE_CATEGORY_URL;
const query = ref(route.query.q || ''); // เก็บคำค้นหา

// ฟังก์ชันดึงข้อมูลผลการค้นหา
const fetchSearchResults = async () => {
  if (!query.value) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(
      `${baseUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${query.value}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }
    const data = await response.json();
    searchResults.value = data.results || [];
  } catch (error) {
    console.error('Error fetching search results:', error);
    errorMessage.value = 'Unable to load search results.';
  } finally {
    loading.value = false;
  }
};

// ฟังก์ชันดึงข้อมูลหมวดหมู่สำหรับ Sidebar
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
  }
};

// อัปเดตคำค้นหาเมื่อมีการเปลี่ยนแปลงใน route
watch(
  () => route.query.q,
  (newQuery) => {
    query.value = newQuery || '';
    fetchSearchResults();
  }
);

onMounted(() => {
  fetchSearchResults();
  fetchCategories();
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
      <main class="flex-1 p-6 mt-6 ml-72">
        <!-- คำค้นหา -->
        <h1 class="mb-4 text-3xl font-bold text-red-500">
          Search Results: <span class="text-white">{{ query }}</span>
        </h1>

        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <p class="text-gray-400">Loading...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="text-center">
          <p class="text-red-500">{{ errorMessage }}</p>
        </div>

        <!-- Search Results -->
        <div v-else-if="searchResults.length > 0">
          <ul class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <li
              v-for="movie in searchResults"
              :key="movie.id"
              class="p-4 rounded-lg cursor-pointer bg-zinc-800"
            >
              <img
                :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : '/placeholder-image.jpg'"
                :alt="movie.title || 'No Title'"
                class="mb-2 rounded-lg"
              />
              <h3 class="text-lg font-semibold">{{ movie.title || 'Untitled' }}</h3>
              <p class="text-sm text-gray-400">{{ movie.release_date || 'Unknown release date' }}</p>
            </li>
          </ul>
        </div>

        <!-- No Results Found -->
        <div v-else class="text-center">
          <p class="text-gray-400">No results found for "{{ query }}"</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ปรับแต่ง CSS เพิ่มเติมถ้าต้องการ */
</style>
