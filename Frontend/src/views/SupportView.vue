<script setup>
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ref, onMounted } from 'vue';

const categories = ref([]); // You can keep this empty if it's not needed
const categoryUrl = import.meta.env.VITE_CATEGORY_URL;

// Fetch categories
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
    errorMessage.value = 'Unable to load categories.';
  }
};

onMounted(() => {
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
      <main class="flex items-center justify-center flex-1 p-6 ml-64" style="margin-top: 10rem;">
        <!-- Support Information Section -->
        <section class="text-center">

          <!-- Support Information Section -->
          <h2 class="mb-6 text-2xl font-semibold text-white animate-fade-in">
            Support Information
          </h2>

          <div class="relative h-1 max-w-xs mx-auto mt-10 mb-4 bg-red-500 rounded-full"></div>
          <div class="m-10 font-bold text-red-500 text-8xl animate-fade-in">
            <p>THANK YOU</p>
          </div>
          <div class="relative h-1 max-w-xs mx-auto mb-4 bg-red-500 rounded-full"></div>

          <!-- Static Information -->
          <div class="mt-10 mb-4 text-xl text-white animate-fade-in">
            <p><strong>Name:</strong> Arin Sudakijjathon</p>
            <p><strong>Student Number:</strong> 65130500088</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-in-out;
}

.relative {
  position: relative;
}

h2, p {
  margin: 10px 0;
}
</style>
