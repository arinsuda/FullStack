<script setup>
  import { ref, onMounted } from "vue"
  import Navbar from "../components/Navbar.vue"
  import Sidebar from "../components/Sidebar.vue"
  import Slider from "../components/Slider.vue"
  import MovieGrid from "../components/MovieGrid.vue"

  const apiKey = import.meta.env.VITE_API_KEY
  const baseUrl = import.meta.env.VITE_BASE_KEY
  const imageUrl = "https://image.tmdb.org/t/p/w500"
  const categoryUrl = import.meta.env.VITE_CATEGORY_URL

  const movies = ref([])
  const categories = ref([])
  const currentPage = ref(1) // ตัวแปรเก็บเลขหน้าปัจจุบัน

  // ฟังก์ชัน fetch ข้อมูลหนัง
  const fetchPopularMovies = async (page = 1) => {
    try {
      const response = await fetch(
        `${baseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch movies")
      }
      const data = await response.json()
      movies.value = data.results
    } catch (error) {
      console.error("Error fetching movies:", error)
    }
  }

  // ฟังก์ชัน fetch ประเภทหนัง
  const fetchCategories = async () => {
    try {
      const response = await fetch(categoryUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      categories.value = data.sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName)
      )
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // เรียกใช้ fetchMovies เมื่อ component ถูก mount
  onMounted(() => {
    fetchPopularMovies()
    fetchCategories()
  })

  // ฟังก์ชันสำหรับไปหน้าถัดไป
  const goToNextPage = () => {
    currentPage.value += 1
    fetchPopularMovies(currentPage.value) // Fetch หน้าใหม่
  }

  const goToPreviousPage = () => {
    currentPage.value -= 1
    fetchPopularMovies(currentPage.value) // Fetch หน้าใหม่
  }
</script>

<template>
  <div class="flex flex-col min-h-screen text-white bg-zinc-900">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <div class="flex flex-1 pt-16">
      <!-- Sidebar -->
      <Sidebar :categories="categories" />

      <!-- Main Section -->
      <main class="flex-1 p-6 ml-64">
        <!-- Slider Section -->
        <div
          class="rounded-lg overflow shadow-lg transition-transform duration-500 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,0,0.6)]"
        >
          <Slider />
        </div>

        <!-- Movie Grid Section -->
        <div class="grid grid-cols-1 gap-8 mx-5 animate-fade-in">
          <MovieGrid :movies="movies" :imageUrl="imageUrl" />
        </div>

        <!-- Pagination Controls -->
        <div class="flex justify-center mt-8 mb-4">
          <!-- Previous Page Button -->
          <button
            v-if="currentPage !== 1"
            class="px-6 py-2 mx-4 text-white transition-transform transform bg-red-500 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-300"
            @click="goToPreviousPage"
          >
            Previous Page
          </button>

          <!-- Current Page Indicator -->
          <span class="px-6 py-2 text-lg font-bold text-gray-200">
            Page {{ currentPage }}
          </span>

          <!-- Next Page Button -->
          <button
            class="px-6 py-2 mx-4 text-white transition-transform transform bg-red-500 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-300"
            @click="goToNextPage"
          >
            Next Page
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.8s ease-in-out;
  }
</style>
