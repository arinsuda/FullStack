<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import Navbar from "@/components/Navbar.vue"
import Sidebar from "@/components/Sidebar.vue"
import EditUser from "../components/EditUser.vue"

const categoryUrl = import.meta.env.VITE_CATEGORY_URL
const user = ref(null)
const router = useRouter()
const categories = ref([])
const isModalOpen = ref(false) 

// ดึงข้อมูลผู้ใช้จาก API
const fetchUserData = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  if (!token) {
    router.push({ name: "Login" })
    return
  }

  const userId = getUserIdFromToken(token)

  try {
    const response = await fetch(`http://localhost:3333/users/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user data")
    }


    
    const data = await response.json()
    user.value = data.data[0]
  } catch (error) {
    console.error("Error fetching user data:", error)
    router.push({ name: "Login" }) // ถ้าดึงข้อมูลไม่ได้ ให้กลับไปที่หน้าล็อกอิน
  }
}

const openEditModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveChanges = async (updatedUser) => {
  const token = JSON.parse(localStorage.getItem("token"))
  if (!token || !updatedUser) {
    return
  }

  const userId = getUserIdFromToken(token)

  try {
    const response = await fetch(`http://localhost:3333/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
      })
    })

    if (!response.ok) {
      throw new Error("Failed to save changes")
    }

    const data = await response.json()
    user.value = data.data[0]
    await fetchUserData()
    closeModal()
  } catch (error) {
    console.error("Error saving changes:", error)
  }
}

const getUserIdFromToken = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1])) // Decode the JWT payload
  return payload.userId // ให้ return userId จาก payload
}

// ฟังก์ชันที่ใช้ตรวจสอบว่าเป็นเจ้าของโปรไฟล์หรือไม่
const checkIfOwner = profileId => {
  const payload = localStorage.getItem("payload")
  const userPayload = payload ? JSON.parse(payload) : null
  return userPayload && userPayload.userId === profileId
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
  fetchUserData() // ดึงข้อมูลผู้ใช้เมื่อโหลดหน้า
  fetchCategories() // ดึง categories
})
</script>

<template>
  <div class="flex flex-col min-h-screen text-white bg-zinc-900" style="margin-top: 2rem">
    <Navbar />
    <div class="flex flex-1 pt-16">
      <Sidebar :categories="categories" />
      <main class="flex-1 p-6 ml-64">
        <div v-if="user" class="space-y-6 text-center">
          <div class="flex flex-col items-center space-y-4">
            <div class="w-32 h-32 overflow-hidden rounded-full bg-zinc-700">
              <img :src="user.profilePicture || 'https://www.svgrepo.com/show/474079/profile.svg'" alt="Profile Picture" class="object-cover w-full h-full" />
            </div>
            <h2 class="text-3xl font-bold">{{ user.username }}</h2>
            <p class="text-gray-400">{{ user.bio || "No bio provided" }}</p>
          </div>

          <div class="p-6 mx-10 rounded-lg shadow bg-zinc-800">
            <h3 class="mb-4 ml-4 text-xl font-semibold">Profile Information</h3>
            <div class="space-y-3">
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Joined:</strong> {{ new Date(user.iat * 1000).toLocaleDateString() }}</p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex justify-center space-x-4">
            <button v-if="checkIfOwner(user.id)" @click="openEditModal" class="px-6 py-3 font-bold text-white rounded-3xl bg-zinc-700 hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-400">Edit Account</button>
            <button @click="logout" class="px-6 py-3 font-bold text-white bg-red-500 rounded-3xl hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400">Logout</button>
          </div>
          
        </div>
        

        <div v-else class="flex flex-col items-center justify-center min-h-screen space-y-6">
          <h2 class="text-3xl font-bold">Welcome to MOVIE<span class="text-red-500">HUB</span></h2>
          <p class="text-gray-400">Please login or register to view your profile.</p>
          <div class="flex justify-center space-x-4">
            <button @click="goToLogin" class="px-6 py-3 font-bold text-white bg-red-500 rounded-xl">Login</button>
            <button @click="goToRegister" class="px-6 py-3 font-bold text-white bg-gray-700 rounded-xl">Register</button>
          </div>
        </div>
        <EditUser v-if="isModalOpen && user" :user="user" @close="closeModal" @save="saveChanges" />

      </main>
    </div>
  </div>
</template>

<style scoped>
  @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
</style>
