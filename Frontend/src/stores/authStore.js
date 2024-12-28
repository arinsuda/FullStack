import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    payload: null,
  }),

  actions: {
    setTokens(tokenData) {
      this.token = tokenData.token
      this.payload = tokenData.payload
      localStorage.setItem('token', JSON.stringify(tokenData.token))
      localStorage.setItem('payload', JSON.stringify(tokenData.payload))
    },

    setPayload(payload) {
      this.payload = payload
      localStorage.setItem('payload', JSON.stringify(payload))
    },

    clearTokens() {
      this.token = null
      this.payload = null
      localStorage.removeItem('token')
      localStorage.removeItem('payload')
    },

    loadFromLocalStorage() {
      const token = localStorage.getItem('token')
      const payload = localStorage.getItem('payload')
      
      if (token) {
        this.token = JSON.parse(token)
      }

      if (payload) {
        this.payload = JSON.parse(payload)
      }
    },
  },
})
