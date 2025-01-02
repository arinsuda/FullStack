<script setup>
import { ref, onMounted, watch } from "vue"
import { useRoute,useRouter } from "vue-router"
import Navbar from "@/components/Navbar.vue"
import Sidebar from "@/components/Sidebar.vue"

const backendUrl = import.meta.env.VITE_CATEGORY_URL
const baseUrl = import.meta.env.VITE_BASE_KEY
const apiKey = import.meta.env.VITE_API_KEY

const route = useRoute()
const router = useRouter() 
const categoryId = ref(parseInt(route.params.id))

const categoryName = ref("")
const tmdbGenreId = ref(null)
const movies = ref([])
const categories = ref([])

const goToMovieDetail = (movieId) => {
  router.push({ name: 'MovieDetail', params: { id: movieId } })  // นำทางไปยัง MovieDetail.vue โดยใช้ movieId
}

// ฟังก์ชันดึงข้อมูลจาก backend
const fetchCategoryFromBackend = async () => {
  try {
    const response = await fetch(`${backendUrl}`)
    if (!response.ok)
      throw new Error(`Failed to fetch categories: ${response.status}`)

    const fetchedCategories = await response.json()
    // เรียงลำดับ categories ตามตัวอักษร
    categories.value = fetchedCategories.sort((a, b) => a.categoryName.localeCompare(b.categoryName))
    const category = fetchedCategories.find(cat => cat.id === categoryId.value)
    categoryName.value = category ? category.categoryName : "Unknown Category"
  } catch (error) {
    console.error("Error fetching category from backend:", error)
    categoryName.value = "Unknown Category"
  }
}

// ฟังก์ชันสำหรับดึงข้อมูล TMDB
const fetchTmdbGenreId = async () => {
  try {
    const response = await fetch(
      `${baseUrl}/genre/movie/list?api_key=${apiKey}&language=en-US`
    )
    if (!response.ok) throw new Error("Failed to fetch TMDB genres")

    const data = await response.json()
    const genre = data.genres.find(
      g => g.name.toLowerCase() === categoryName.value.toLowerCase()
    )
    tmdbGenreId.value = genre ? genre.id : null
  } catch (error) {
    console.error("Error fetching TMDB Genre ID:", error)
    tmdbGenreId.value = null
  }
}

const fetchMoviesByCategory = async () => {
  if (!tmdbGenreId.value) {
    console.error("Invalid TMDB Genre ID")
    movies.value = []  // กำหนดให้ movies เป็นค่าว่างเมื่อไม่มี TMDB Genre ID
    return
  }

  try {
    const response = await fetch(
      `${baseUrl}/discover/movie?api_key=${apiKey}&language=en-US&with_genres=${tmdbGenreId.value}`
    )
    if (!response.ok) throw new Error("Failed to fetch movies")

    const data = await response.json()
    movies.value = data.results || []
  } catch (error) {
    console.error("Error fetching movies:", error)
    movies.value = []
  }
}

// ฟังก์ชันที่จะถูกเรียกเมื่อ categoryId เปลี่ยน
const loadCategoryData = async () => {
  await fetchCategoryFromBackend()
  await fetchTmdbGenreId()
  await fetchMoviesByCategory()
}

// ใช้ watch เพื่อตรวจจับการเปลี่ยนแปลงของ route.params.id
watch(() => route.params.id, (newId) => {
  categoryId.value = parseInt(newId) // เปลี่ยนค่า categoryId ใหม่
  loadCategoryData()  // รีเฟรชข้อมูล
})

onMounted(() => {
  loadCategoryData()
})
</script>

<template>
  <div class="flex flex-col min-h-screen text-white bg-zinc-900" style="margin-top:  2rem;">
    <!-- Navbar -->
    <Navbar />

    <div class="flex flex-1 pt-16">
      <!-- Sidebar -->
      <Sidebar :categories="categories" />

      <!-- Main Content -->
      <main class="flex-1 p-6 ml-64">
        <h1 class="mb-4 text-3xl font-bold text-red-500">
          Category: <span class="text-white">{{ categoryName }}</span>
        </h1>

        <!-- หากไม่พบหนังหรือไม่มีผลลัพธ์ -->
        <div v-if="movies.length > 0">
          <h2 class="mb-4 text-2xl">Movies in {{ categoryName }}</h2>
          <ul class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <li
              v-for="movie in movies"
              :key="movie.id"
              class="p-4 rounded-lg bg-zinc-800"
              @click="goToMovieDetail(movie.id)"
            >
              <img
                :src="'https://image.tmdb.org/t/p/w500' + movie.poster_path"
                :alt="movie.title"
                class="mb-2 rounded-lg"
              />
              <h3 class="text-lg font-semibold">{{ movie.title }}</h3>
              <p class="text-sm text-gray-400">{{ movie.release_date }}</p>
            </li>
          </ul>
        </div>

        <!-- กรณีที่ไม่มีผลลัพธ์ -->
        <div v-else>
          <p class="text-gray-400">
            {{ tmdbGenreId === null ? 'No result found for movies in this category.' : 'No result found for movies in this category.' }}
          </p>
        </div>
      </main>
    </div>
  </div>
</template>
