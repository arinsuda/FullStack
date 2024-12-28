<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="w-1/3 p-6 rounded-lg bg-zinc-800">
        <h2 class="mb-4 text-2xl font-semibold text-white">Write a Review</h2>
        <textarea 
          v-model="newReview.comment" 
          class="w-full h-24 p-2 mb-4 text-gray-100 rounded-lg bg-zinc-700" 
          placeholder="Your comment"
        ></textarea>
        <input 
          v-model="newReview.rating" 
          type="number" 
          min="0" 
          max="10"
          class="w-full p-2 mb-4 text-gray-100 rounded-lg bg-zinc-700"
          placeholder="Your rating (0-10)" 
        />
        <div class="flex justify-end gap-2">
          <button 
            @click="submitReview" 
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
          <button 
            @click="closeModal" 
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    isOpen: {
      type: Boolean,
      required: true
    },
    movieId: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['close', 'submitReview']);
  
  const newReview = ref({
    comment: '',
    rating: 0
  });
  
  // Close the modal
  const closeModal = () => {
    emit('close');
  };
  
  // Submit the review
  const submitReview = async () => {
    try {
      const response = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: newReview.value.comment,
          rating: newReview.value.rating,
          movieId: props.movieId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
  
      emit('submitReview');  // Notify parent to refresh reviews
      closeModal();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };
  </script>
  
  <style scoped>
  textarea, input {
    transition: all 0.3s;
  }
  
  textarea:focus, input:focus {
    outline: none;
    border-color: #4c9ee1;
  }
  </style>
  