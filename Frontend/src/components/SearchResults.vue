<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';

const apiKey = import.meta.env.VITE_API_KEY;
const baseUrl = import.meta.env.VITE_BASE_KEY;
const searchResults = ref([]);
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const errorMessage = ref('');
const categories = ref([]);
const categoryUrl = import.meta.env.VITE_CATEGORY_URL;
const query = ref(route.query.q || '');

// ฟังก์ชันดึงข้อมูลหมวดหมู่
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

// ฟังก์ชันดึงข้อมูลผลการค้นหา
const fetchSearchResults = async () => {
  if (!query.value) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    const movieResults = await fetch(
      `${baseUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${query.value}`
    ).then((res) => (res.ok ? res.json() : null));

    const tvResults = !movieResults?.results?.length
      ? await fetch(
          `${baseUrl}/search/tv?api_key=${apiKey}&language=en-US&query=${query.value}`
        ).then((res) => (res.ok ? res.json() : null))
      : null;

    // ใช้ผลลัพธ์ที่พบ
    searchResults.value =
      movieResults?.results?.length > 0
        ? movieResults.results
        : tvResults?.results || [];

    // หากไม่มีข้อมูลจากทั้งสอง API
    if (searchResults.value.length === 0) {
      errorMessage.value = 'No results found.';
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    errorMessage.value = 'Unable to load search results.';
  } finally {
    loading.value = false;
  }
};

// ฟังก์ชันสำหรับนำทางไปยังรายละเอียด
const goToDetail = async (id, type) => {
  const detailRoute = type === 'movie' ? 'MovieDetail' : 'TvDetail';

  try {
    const response = await fetch(
      `${baseUrl}/${type}/${id}?api_key=${apiKey}&language=en-US`
    );

    if (response.ok) {
      router.push({ name: detailRoute, params: { id } });
    } else {
      throw new Error('No match found for this item.');
    }
  } catch (error) {
    console.error('Error navigating to detail:', error);
    errorMessage.value = 'Unable to load details for this item.';
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
              v-for="item in searchResults"
              :key="item.id"
              class="p-4 rounded-lg cursor-pointer bg-zinc-800"
              @click="goToDetail(item.id, item.media_type || 'movie')"
            >
              <img
                :src="item.poster_path ? 'https://image.tmdb.org/t/p/w500' + item.poster_path : '/placeholder-image.jpg'"
                :alt="item.title || item.name || 'No Title'"
                class="mb-2 rounded-lg"
              />
              <h3 class="text-lg font-semibold">{{ item.title || item.name || 'Untitled' }}</h3>
              <p class="text-sm text-gray-400">{{ item.release_date || item.first_air_date || 'Unknown release date' }}</p>
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
