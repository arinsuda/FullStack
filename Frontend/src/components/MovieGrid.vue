<script setup>
import { defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  movies: {
    type: Array,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const router = useRouter();

const goToMovieDetail = (id) => {
  router.push({ name: "MovieDetail", params: { id } });
};
</script>

<template>
  <div class="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
    <div
      v-for="movie in movies"
      :key="movie.id"
      class="overflow-hidden rounded-lg cursor-pointer bg-zinc-800 transition-transform duration-300 shadow-lg hover:scale-105 hover:shadow-[0_0_15px_5px_rgba(255,0,0,0.6)]"
      @click="goToMovieDetail(movie.id)"
    >
      <img
        v-if="movie.poster_path"
        :src="`${imageUrl}${movie.poster_path}`"
        alt="Movie Poster"
        class="object-cover w-full transition-opacity duration-300 h-84 hover:opacity-90"
      />
      <img
        v-else
        src="https://via.placeholder.com/500x750?text=No+Image"
        alt="No Image"
        class="object-cover w-full transition-opacity duration-300 h-84 hover:opacity-90"
      />
      <div class="p-4 text-center">
        <h3
          class="font-bold text-white truncate transition-all duration-300 text-md hover:text-red-500"
        >
          {{ movie.title }}
        </h3>
        <p class="text-xs text-gray-400">{{ movie.release_date }}</p>
      </div>
    </div>
  </div>
</template>
