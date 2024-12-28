<script setup>
  import { ref, onMounted } from 'vue'

  // Accepting the 'id' prop from the router
  const props = defineProps({
    isOpen: Boolean,
    id: String,  // The 'id' prop from the route will be passed here
  })

  const userProfile = ref('/default-profile.png')
  const username = ref('Anonymous')
  const reviewComment = ref('')
  const reviewRating = ref(0)

  // Emits to communicate with the parent
  const emit = defineEmits(['close', 'submit'])

  // Function to handle closing the modal
  const closeModal = () => {
    emit('close')
  }

  // Function to handle submitting the review
  const submitReview = () => {
    emit('submit', {
      comment: reviewComment.value,
      rating: reviewRating.value,
      movieId: props.id,  // Send the movie ID with the review
    })

    // Clear review state after submission
    reviewComment.value = ''
    reviewRating.value = 0

    closeModal()
  }

  // Function to handle rating update
  const updateRating = (value) => {
    reviewRating.value = value
  }

  // Initialize user data from localStorage
  onMounted(() => {
    const userPayload = localStorage.getItem('payload')

    if (userPayload) {
      try {
        const user = JSON.parse(userPayload)
        username.value = user.username || 'Anonymous'
        userProfile.value = user.profilePicture || 'https://www.svgrepo.com/show/474079/profile.svg'
      } catch (error) {
        console.error('Invalid userPayload format:', error)
      }
    }
  })
</script>

<template>
  <div v-if="props.isOpen" class="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
    <div class="relative w-11/12 max-w-md p-6 rounded-lg shadow-lg bg-zinc-900">
      <h2 class="mb-4 text-2xl font-bold text-white">Write a Review</h2>

      <!-- User Info -->
      <div class="flex items-center mt-5 mb-6 space-x-4">
        <img :src="userProfile" alt="User Profile" class="w-12 h-12 rounded-full" />
        <span class="text-lg font-bold text-gray-300">{{ username }}</span>
      </div>

      <!-- Close Button -->
      <button @click="closeModal" class="absolute text-gray-300 top-4 right-4 hover:text-gray-500">
        ✖
      </button>

      <div>
        <!-- Comment Section -->
        <div class="mb-4">
          <label for="comment" class="block mb-2 text-sm text-gray-300">Comment</label>
          <textarea
            id="comment"
            v-model="reviewComment"
            rows="4"
            class="w-full px-4 py-2 text-sm text-gray-300 border border-gray-700 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Write your review here..."
          ></textarea>
        </div>

        <!-- Rating Section -->
        <div class="mb-4">
          <label for="rating" class="block mb-2 text-sm text-gray-300">Rating</label>
          <div class="flex items-center space-x-1">
            <template v-for="star in 10" :key="star">
              <span
                :class="[
                  'cursor-pointer text-gray-500 transition duration-200',
                  star <= reviewRating ? 'text-yellow-400' : 'hover:text-yellow-200',
                ]"
                @click="updateRating(star)"
              >
                <i class="fas fa-star"></i>
              </span>
              <span
                v-if="star < 10 && star + 0.5 === reviewRating"
                class="text-yellow-400 transition duration-200 cursor-pointer"
                @click="updateRating(star + 0.5)"
              >
                <i class="fas fa-star-half-alt"></i>
              </span>
            </template>
          </div>
          <p class="mt-2 text-sm text-gray-400">You rated: {{ reviewRating }}</p>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-4">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="submitReview"
            class="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .fas {
    font-size: 1.5rem;
  }
</style>
