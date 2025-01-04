<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import auth from "@/lib/auth.js";

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errorMessage = ref("");
const showError = ref(false);
const router = useRouter();

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const displayError = (message) => {
  errorMessage.value = message;
  showError.value = true;

  // ซ่อนข้อความอัตโนมัติหลังจาก 3 วินาที
  setTimeout(() => {
    showError.value = false;
  }, 3000);
};

const userRegister = async () => {
  // ตรวจสอบว่าแต่ละฟิลด์ไม่ว่าง
  if (!username.value.trim()) {
    displayError("Username is required.");
    return;
  }

  if (!email.value.trim()) {
    displayError("Email is required.");
    return;
  }

  if (!password.value.trim()) {
    displayError("Password is required.");
    return;
  }

  if (!confirmPassword.value.trim()) {
    displayError("Please confirm your password.");
    return;
  }

  // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกัน
  if (password.value !== confirmPassword.value) {
    displayError("Passwords do not match!");
    return;
  }

  const user = {
    username: username.value,
    email: email.value,
    password: password.value,
    password_confirmation: confirmPassword.value,
  };

  try {
    const response = await auth.Register(import.meta.env.VITE_REGISTER_URL, user);

    if (response) {
      router.push({ name: "Login" });
    }
  } catch (error) {
    displayError(error.message || "Registration failed. Please try again.");
  }
};
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
          REGISTER
        </h2>

        <!-- Error Message with Transition -->
        <transition name="slide">
          <div
            v-if="showError"
            class="fixed w-3/4 max-w-md p-3 font-semibold text-center text-white transform -translate-x-1/2 bg-red-800 rounded-lg shadow-lg top-10 left-1/2"
          >
            {{ errorMessage }}
          </div>
        </transition>

        <!-- Input Section -->
        <div class="space-y-4">
          <!-- Username Input -->
          <div class="relative">
            <label for="username" class="block text-sm text-gray-300">Username</label>
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

          <!-- Email Input -->
          <div class="relative">
            <label for="email" class="block text-sm text-gray-300">Email</label>
            <input
              v-model="email"
              type="email"
              id="email"
              name="email"
              class="w-full px-4 py-2 pl-10 mt-1 text-white bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 duration-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.6)]"
            />
            <img
              src="/assets/mail-icon.svg"
              alt="email"
              class="absolute w-5 h-5 text-gray-400 left-3 top-1/2 "
            />
          </div>

          <!-- Password Input -->
          <div class="relative">
            <label for="password" class="block text-sm text-gray-300">Password</label>
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
                  class="w-5 h-5"
                />
                <img
                  v-else
                  src="/assets/eye-slash.svg"
                  alt="eyeclose"
                  class="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="relative">
            <label for="confirmPassword" class="block text-sm text-gray-300">Confirm Password</label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                name="confirmPassword"
                class="w-full px-10 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 duration-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.6)]"
              />
              <img
                src="/assets/padlock.svg"
                alt="padlock"
                class="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 h-2/5"
              />
              <button
                type="button"
                @click="toggleConfirmPassword"
                class="absolute inset-y-0 flex items-center text-gray-400 right-3"
              >
                <img
                  v-if="showConfirmPassword"
                  src="/assets/eye-open.svg"
                  alt="eyeopen"
                  class="w-5 h-5"
                />
                <img
                  v-else
                  src="/assets/eye-slash.svg"
                  alt="eyeclose"
                  class="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <!-- Register Button -->
          <button
            @click="userRegister"
            class="w-full px-4 py-3 font-bold text-white duration-300 bg-red-600 rounded-xl hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            REGISTER
          </button>
        </div>

        <p class="mt-10 text-sm text-center text-gray-400">
          Already have an account?
          <router-link
            :to="{ name: 'Login' }"
            class="text-red-500 hover:underline"
          >Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style>
/* แอนิเมชันสำหรับ slide-in/slide-out */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
