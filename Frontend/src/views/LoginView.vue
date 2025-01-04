<script setup>
  import { ref, onMounted } from "vue"
  import { useRouter } from "vue-router"
  import auth from "@/lib/auth.js"

  const router = useRouter()

  const errorMessage = ref("")
  const username = ref("")
  const password = ref("")
  const showPassword = ref(false)

  const showError = message => {
    errorMessage.value = message
    setTimeout(() => {
      errorMessage.value = ""
    }, 10000)
  }

  const closeErrorBox = () => {
    errorMessage.value = ""
  }

  const userLogin = async () => {
    try {
      const user = {
        username: username.value,
        password: password.value,
      }
      const response = await auth.Login(
        import.meta.env.VITE_LOGIN_URL,
        user,
        showError
      )

      if (response.status === 201) {
        router.push({ name: "Home" })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const togglePassword = () => {
    showPassword.value = !showPassword.value
  }

  const continueAsGuest = () => {
    router.push({ name: "Home" })
  }
  
</script>

<template>
  <div
    class="h-screen bg-center bg-cover"
    :style="{ backgroundImage: 'url(/src/assets/bg.png)' }"
  >
    <div class="flex items-center justify-center h-full">
      <div class="w-full max-w-md p-10 shadow-lg bg-black/75 rounded-xl">
        <!-- App Title -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-white">
            MOVIE<span class="text-red-500">HUB</span>
          </h1>
          <p class="mt-2 text-sm text-gray-400">
            Welcome to MovieHub - Your Ultimate Destination for Movie Reviews
            and Recommendations!
          </p>
        </div>

        <h2 class="mb-6 text-2xl font-semibold text-center text-white">
          LOGIN
        </h2>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="p-3 mb-4 text-center text-white bg-red-500 rounded"
        >
          <p>{{ errorMessage }}</p>
          <button
            @click="closeErrorBox"
            class="mt-2 text-sm underline focus:outline-none"
          >
            Close
          </button>
        </div>

        <!-- Input Section -->
        <div class="space-y-4">
          <!-- Username Input -->
          <div class="relative">
            <label for="username" class="block text-sm text-gray-300"
              >Username</label
            >
            <input
              v-model="username"
              type="text"
              id="username"
              name="username"
              class="w-full px-4 py-2 pl-10 mt-1 text-white bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 duration-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.6)]"
            />
            <img
              src="/assets/username-icon.svg"
              alt="user"
              class="absolute w-5 h-5 text-gray-400 left-3 top-1/2"
            />
          </div>

          <!-- Password Input -->
          <div class="relative">
            <label for="password" class="block text-sm text-gray-300"
              >Password</label
            >
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                class="w-full px-10 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 duration-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.6)]"
              />
              <img
                src="/assets/padlock.svg"
                alt="padlock"
                class="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 h-2/5"
              />
              <button
                type="button"
                @click="togglePassword"
                class="absolute inset-y-0 flex items-center text-gray-400 right-3"
              >
                <img
                  v-if="showPassword"
                  src="/assets/eye-open.svg"
                  alt="eyeopen"
                  class="w-5 h-5 text-gray-400"
                />
                <img
                  v-else
                  src="/assets/eye-slash.svg"
                  alt="eyeclose"
                  class="w-5 h-5 text-gray-400"
                />
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div
            class="flex flex-col items-center gap-4"
            style="margin-top: 2rem"
          >
            <!-- Login Button -->
            <button
              @click="userLogin"
              class="w-full px-4 py-3 font-bold text-white duration-300 bg-red-600 rounded-xl hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-400"
            >
              LOGIN
            </button>

            <!-- Continue as Guest -->
            <button
              @click="continueAsGuest"
              class="px-2 py-1 text-sm font-semibold text-white duration-300 bg-zinc-700 w-80 rounded-xl hover:bg-zinc-600 focus:outline-none focus:ring-4 focus:ring-gray-400"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        <p class="mt-10 text-sm text-center text-gray-400">
          I don't have an account.
          <router-link
            :to="{ name: 'Register' }"
            class="text-red-500 hover:underline"
          >
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
