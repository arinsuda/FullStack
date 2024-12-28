<script setup>
  import { ref, onMounted } from "vue"
  import { useRouter } from "vue-router"
  import Navbar from "@/components/Navbar.vue"
  import Sidebar from "@/components/Sidebar.vue"
  import { getData } from "@/lib/info.js"

  const user = ref(null)
  const router = useRouter()
  const likedMovies = ref([])

  const checkUserPayload = () => {
    const payload = localStorage.getItem("payload")
    if (payload) {
      user.value = JSON.parse(payload)
    }
  }

  const getMyLike = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"))
      if (token) {
        const userId = token.id
        const result = await getData(
          `${import.meta.env.VITE_BASE_URL}/users/likes`,
          userId
        )
        console.log(result);
        
        likedMovies.value = result.data
      }
    } catch (error) {
      console.error("Error fetching liked movies:", error)
    }
  }

  const categories = ref([])
  const categoryUrl = import.meta.env.VITE_CATEGORY_URL
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

  const goToLogin = () => {
    router.push({ name: "Login" })
  }

  const goToRegister = () => {
    router.push({ name: "Register" })
  }

  onMounted(async () => {
    checkUserPayload()
    if (user.value) {
      await getMyLike()
    }
    fetchCategories()
  })
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
            class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <div
              v-for="movie in likedMovies"
              :key="movie.id"
              class="p-4 bg-gray-800 rounded shadow hover:shadow-lg"
            >
              <h3 class="mb-2 text-lg font-bold">{{ movie.title }}</h3>
              <p class="text-gray-400">{{ movie.description }}</p>
              <p class="mt-2 text-sm text-gray-500">
                Liked at: {{ new Date(movie.likedAt).toLocaleString() }}
              </p>
            </div>
          </div>
          <div v-else class="text-center text-gray-400">
            You have not liked any movies yet.
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
  @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
</style>
