<script setup>
import { defineProps } from 'vue'

// รับ prop ชื่อ categories จาก CategoryView.vue
const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <aside 
    class="fixed top-0 left-0 flex flex-col w-64 h-screen p-6 ml-3 overflow-y-auto shadow-lg bg-zinc-800 rounded-xl" 
    style="margin-top: 7rem;"
  >
    <!-- Section: User Information -->
    <h2 class="mb-6 text-xl font-bold tracking-wide text-gray-200">YOUR INFORMATION</h2>
    <ul class="space-y-4">
      <li class="group">
        <router-link
          :to="{ name: 'Profile' }"
          class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-red-500 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
        >
          <span class="mr-3 material-icons group-hover:animate-pulse">account_circle</span>
          Profile
        </router-link>
      </li>
      <li class="group">
        <router-link
          :to="{ name: 'Like' }"
          class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-red-500 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
        >
          <span class="mr-3 material-icons group-hover:animate-pulse">favorite</span>
          Like
        </router-link>
      </li>
      <li class="group">
        <router-link
          :to="{ name: 'Watchlist' }"
          class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-red-500 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
        >
          <span class="mr-3 material-icons group-hover:animate-pulse">visibility</span>
          Watchlist
        </router-link>
      </li>
      <li class="group">
        <router-link
          :to="{ name: 'Reviewed' }"
          class="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-red-500 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
        >
          <span class="mr-3 material-icons group-hover:animate-pulse">rate_review</span>
          Reviewed
        </router-link>
      </li>
    </ul>

    <!-- Section: Categories -->
    <div class="mt-10">
      <h2 class="mb-4 text-xl font-bold tracking-wide text-gray-200">CATEGORIES</h2>
      <ul class="space-y-3">
        <li
          v-for="category in props.categories"
          :key="category.id"
          class="cursor-pointer group"
        >
          <router-link
            :to="{ name: 'Category', params: { id: category.id } }"
            class="block px-3 py-2 text-gray-300 rounded-lg hover:text-red-500 hover:shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] transition-all duration-300"
          >
            {{ category.categoryName }}
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
/* เพิ่มความสามารถในการ scroll */
aside {
  height: calc(100vh - 3rem); /* ให้ความสูงลดลงตาม margin-top */
  overflow-y: auto; /* เพิ่ม scroll สำหรับเนื้อหาที่ยาวเกิน */
}

@media screen and (max-width: 768px) {
  aside {
    width: 100%; /* ให้ Sidebar ครอบคลุมทั้งหน้าจอเมื่อจอเล็ก */
    margin-top: 0; /* ปรับ margin-top ออกสำหรับมือถือ */
  }
}
</style>


