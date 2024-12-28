<script setup>
  import { ref, onMounted } from "vue"
  import { useRouter } from "vue-router"
  import Navbar from "@/components/Navbar.vue"
  import Sidebar from "@/components/Sidebar.vue"

  const categoryUrl = import.meta.env.VITE_CATEGORY_URL
  const user = ref(null)
  const router = useRouter()
  const categories = ref([])

  const checkUserPayload = () => {
    const payload = localStorage.getItem("payload")
    if (payload) {
      user.value = JSON.parse(payload)
    }
  }

  const checkIfOwner = profileId => {
    const payload = localStorage.getItem("payload")
    const userPayload = payload ? JSON.parse(payload) : null
    return userPayload && userPayload.id === profileId
  }

  const goToLogin = () => {
    router.push({ name: "Login" })
  }

  const goToRegister = () => {
    router.push({ name: "Register" })
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("payload")
    user.value = null
    router.push({ name: "Login" })
  }

  const goToEditAccount = () => {
    router.push({ name: "EditAccount" })
  }

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

  onMounted(() => {
    checkUserPayload()
    fetchCategories()
  })
</script>

<template>
  <div
    class="flex flex-col min-h-screen text-white bg-zinc-900"
    style="margin-top: 2rem"
  >
    <!-- Use Navbar component -->
    <Navbar />

    <div class="flex flex-1 pt-16">
      <!-- Use Sidebar component -->
      <Sidebar :categories="categories" />

      <!-- Main Content -->
      <main class="flex-1 p-6 ml-64">
        <!-- Profile Content -->
        <div v-if="user" class="space-y-6 text-center">
          <div class="flex flex-col items-center space-y-4">
            <!-- Profile Picture -->
            <div class="w-32 h-32 overflow-hidden rounded-full bg-zinc-700">
              <img
                :src="user.profilePicture || 'https://www.svgrepo.com/show/474079/profile.svg'"
                alt="Profile Picture"
                class="object-cover w-full h-full"
              />
            </div>
            <!-- Username -->
            <h2 class="text-3xl font-bold">{{ user.username }}</h2>
            <!-- Bio -->
            <p class="text-gray-400">
              {{ user.bio || "No bio provided" }}
            </p>
          </div>

          <div class="p-6 mx-10 rounded-lg shadow bg-zinc-800">
            <h3 class="mb-4 ml-4 text-xl font-semibold">Profile Information</h3>
            <div class="space-y-3">
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p>
                <strong>Joined:</strong>
                {{ new Date(user.iat * 1000).toLocaleDateString() }}
              </p>
            </div>
          </div>

          <!-- Edit and Logout Buttons -->
          <div class="flex justify-center space-x-4">
            <!-- ปุ่ม Edit Account -->
            <button
              v-if="checkIfOwner(user.id)"
              @click="goToEditAccount"
              class="px-6 py-3 font-bold text-white rounded-3xl bg-zinc-700 hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-400 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
            >
              Edit Account
            </button>

            <!-- ปุ่ม Logout -->
            <button
              @click="logout"
              class="px-6 py-3 font-bold text-white bg-red-500 rounded-3xl hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
            >
              Logout
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
            Please login or register to view your profile.
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
