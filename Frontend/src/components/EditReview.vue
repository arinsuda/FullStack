<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-1/3 p-6 rounded-lg shadow-lg bg-zinc-800">
      <h2 class="mb-4 text-xl font-semibold text-white">Edit Review</h2>

      <!-- Rating -->
      <div class="mb-4">
        <label class="block mb-2 font-semibold text-white">Rating:</label>
        <div class="flex gap-1">
          <i
            v-for="n in 10"
            :key="n"
            class="cursor-pointer fas"
            :class="n <= rating ? 'fa-star text-yellow-500' : 'fa-star text-gray-500'"
            @click="rating = n"
          ></i>
        </div>
      </div>

      <!-- Comment -->
      <textarea
        v-model="comment"
        class="w-full p-2 mb-4 text-white border rounded-lg bg-stone-700 focus:ring focus:ring-red-500"
        rows="5"
      ></textarea>

      <!-- Actions -->
      <div class="flex justify-end gap-4">
        <button @click="handleSave" class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">
          Save
        </button>
        <button @click="$emit('close')" class="px-4 py-2 text-gray-800 bg-gray-300 rounded-lg hover:bg-gray-400">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  isOpen: Boolean,
  review: Object,
});

const emit = defineEmits(["save", "close"]);

const comment = ref("");
const rating = ref(null);

watch(
  () => props.review,
  (newReview) => {
    comment.value = newReview?.comment || "";
    rating.value = newReview?.rating || 0;
  },
  { immediate: true }
);

const handleSave = () => {
  emit("save", { id: props.review.id, comment: comment.value, rating: rating.value });
};
</script>