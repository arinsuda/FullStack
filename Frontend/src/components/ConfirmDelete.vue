<template>
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-1/4 p-6 rounded-lg shadow-lg bg-zinc-800">
        <h2 class="mb-4 text-lg font-semibold text-white">
          Are you sure you want to delete this review?
        </h2>
        <div class="flex justify-end gap-4">
          <button
            @click="$emit('confirm')"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Yes, Delete
          </button>
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-800 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    isOpen: Boolean,
  });
  const emit = defineEmits(["confirm", "close"]);
  </script>
  