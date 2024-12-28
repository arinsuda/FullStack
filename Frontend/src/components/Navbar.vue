<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from "vue"
  import { useRouter } from "vue-router"

  const searchQuery = ref("")
  const menuOpen = ref(false)
  const windowWidth = ref(window.innerWidth)
  const router = useRouter()

  const isLargeScreen = computed(() => windowWidth.value >= 1024)

  const searchMovies = () => {
    if (searchQuery.value.trim()) {
      router.push({ name: "SearchResults", query: { q: searchQuery.value } })
      searchQuery.value = ""
    }
  }

  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
  }

  // Update window width on resize
  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener("resize", updateWindowWidth)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateWindowWidth)
  })
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-6 bg-black shadow-md"
  >
    <!-- Logo with Hamburger Menu -->
    <div class="flex items-center space-x-4">
      <!-- Hamburger Menu (Mobile) -->
      <button
        v-if="!isLargeScreen"
        @click="toggleMenu"
        class="block text-white transition-transform duration-500 hover:scale-110 lg:hidden material-icons focus:outline-none"
      >
        menu
      </button>

      <!-- Logo -->
      <h1 class="text-4xl font-bold tracking-wide text-red-500">
        MOVIE<span class="text-white">HUB</span>
      </h1>
    </div>

    <!-- Search Bar -->
    <div class="relative hidden lg:block">
      <input
        v-model="searchQuery"
        @keyup.enter="searchMovies"
        type="text"
        placeholder="Search movies..."
        class="w-72 p-3 text-sm placeholder-gray-400 rounded-lg bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      />
      <span
        @click="searchMovies"
        class="absolute top-2.5 right-3 text-gray-400 cursor-pointer material-icons hover:text-white transition duration-300"
      >
        search
      </span>
    </div>

    <!-- Navigation -->
    <nav class="hidden mr-5 space-x-6 lg:flex">
      <router-link
        :to="{ name: 'Home' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        HOME
      </router-link>
      <router-link
        :to="{ name: 'Movie' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        MOVIES
      </router-link>
      <router-link
        :to="{ name: 'Series' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        SERIES
      </router-link>
      <router-link
        :to="{ name: 'Upcoming' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        UPCOMING
      </router-link>
      <router-link
        :to="{ name: 'Support' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        SUPPORT
      </router-link>
    </nav>
  </header>

  <!-- Mobile Navigation -->
  <div
    v-if="menuOpen"
    class="absolute left-0 right-0 z-20 bg-black shadow-md top-16 lg:hidden rounded-3xl"
    style="margin-top: 1rem"
  >
    <nav class="flex flex-col p-6 space-y-4">
      <router-link
        :to="{ name: 'Home' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        HOME
      </router-link>
      <router-link
        :to="{ name: 'Movie' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        MOVIES
      </router-link>
      <router-link
        :to="{ name: 'Series' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        SERIES
      </router-link>
      <router-link
        :to="{ name: 'Upcoming' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        UPCOMING
      </router-link>
      <router-link
        :to="{ name: 'Support' }"
        class="px-4 py-2 rounded-lg font-semibold text-white hover:text-red-500 hover:bg-zinc-800 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
      >
        SUPPORT
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
  @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
</style>
