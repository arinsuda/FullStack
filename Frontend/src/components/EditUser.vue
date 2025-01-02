<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="w-1/3 p-8 rounded-lg bg-zinc-800">
        <h3 class="mb-4 text-xl font-semibold">Edit Profile</h3>
  
        <!-- Username -->
        <div>
          <label for="username" class="block text-left text-gray-400">Username</label>
          <input
            id="username"
            type="text"
            v-model="user.username"
            class="w-full p-2 text-white rounded bg-zinc-700"
          />
        </div>
  
        <!-- Email -->
        <div>
          <label for="email" class="block text-left text-gray-400">Email</label>
          <input
            id="email"
            type="email"
            v-model="user.email"
            class="w-full p-2 text-white rounded bg-zinc-700"
          />
        </div>
  
        <!-- Bio -->
        <div>
          <label for="bio" class="block text-left text-gray-400">Bio</label>
          <textarea
            id="bio"
            v-model="user.bio"
            class="w-full p-2 text-white rounded bg-zinc-700"
          ></textarea>
        </div>
  
        <!-- Save and Cancel buttons -->
        <div class="flex justify-end mt-4 space-x-4">
          <button
            @click="saveChanges"
            class="px-6 py-3 font-bold text-white bg-red-500 rounded-3xl hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400"
          >
            Save Changes
          </button>
  
          <button
            @click="closeModal"
            class="px-6 py-3 font-bold text-white bg-zinc-600 rounded-3xl hover:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-zinc-400"
          >
            Cancel
          </button>
        </div>
  
        <!-- Close button -->
        <div class="absolute top-2 right-2">
          <button @click="closeModal" class="text-xl text-white">
            &times;
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    user: {
      type: Object,
      required: true,
    }
  })
  
  const emit = defineEmits(['close', 'save'])
  
  const saveChanges = () => {
    emit('save', props.user)
  }
  
  const closeModal = () => {
    emit('close')
  }
  </script>
  