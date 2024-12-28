<!-- src/components/Slider.vue -->
<script setup>
  import { ref, onMounted, onUnmounted  } from "vue"

  const slides = ref([
    {
      id: 1,
      image:
        "https://4kwallpapers.com/images/wallpapers/fast-x-2023-movies-8k-5k-3840x2160-11504.jpg",
      title: "Welcome to MovieHub",
      description: "Discover and explore your favorite movies and series.",
    },
    {
      id: 2,
      image: "https://images5.alphacoders.com/131/1317575.jpeg",
      title: "Experience Cinematic Magic",
      description: "Enjoy a vast collection of movies and series in one place.",
    },
    {
      id: 3,
      image: "https://images8.alphacoders.com/112/1125196.jpg",
      title: "Stream Your Favorites",
      description: "Watch movies and series anytime, anywhere.",
    },
  ])

  const currentSlide = ref(0)

  const changeSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length
  }

  let slideInterval = null

  onMounted(() => {
    slideInterval = setInterval(changeSlide, 5000)
  })

  onUnmounted(() => {
    clearInterval(slideInterval)
  })
</script>

<template>
  <div class="relative overflow-hidden bg-cover rounded-lg h-96" style="margin-top: 2rem;">
    <div
      v-for="(slide, index) in slides"
      :key="slide.id"
      class="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-center bg-cover"
      :class="index === currentSlide ? 'opacity-100' : 'opacity-0'"
      :style="{ backgroundImage: `url(${slide.image})`, objectFit: 'cover' }"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="absolute bottom-0 p-6 text-white">
        <h2 class="text-3xl font-bold">{{ slide.title }}</h2>
        <p class="mt-2 text-sm text-gray-300">{{ slide.description }}</p>
      </div>
    </div>
    
    <!-- Pagination indicators -->
    <div class="absolute flex justify-center w-full gap-2 bottom-4">
      <button
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="w-3 h-3 transition-all duration-300 ease-in-out transform bg-white rounded-full hover:scale-125"
        :class="index === currentSlide ? 'bg-red-500 shadow-lg animate-glow' : 'opacity-50'"
        @click="currentSlide = index"
      ></button>
    </div>
  </div>
</template>

<style scoped>
/* Glowing effect for active pagination button */
@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(255, 0, 0, 0.7), 0 0 10px rgba(255, 0, 0, 0.7); }
  50% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.7), 0 0 20px rgba(255, 0, 0, 0.7); }
  100% { box-shadow: 0 0 5px rgba(255, 0, 0, 0.7), 0 0 10px rgba(255, 0, 0, 0.7); }
}

.animate-glow {
  animation: glow 1.5s infinite alternate;
}

/* Add smooth transition for background image */
.bg-cover {
  transition: background-image 1s ease-in-out;
}

.bg-cover img {
  object-fit: cover; /* Ensures that the image covers the container */
}

</style>


