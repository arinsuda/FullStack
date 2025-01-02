import { ref } from "vue"

export function useReviewApi() {
  const movieUrl = import.meta.env.VITE_MOVIES_URL
  const baseUrl = import.meta.env.VITE_BASE_URL
  const reviews = ref([])
  const totalReviews = ref(0)
  const averageRating = ref(0)

  const fetchReviews = async id => {
    try {
      const response = await fetch(`${movieUrl}/${id}/reviews`)

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.data) {
        const reviewsData = data.data

        for (let review of reviewsData) {
          const userResponse = await fetch(`${baseUrl}/users/${review.userId}`)

          if (userResponse.ok) {
            const userData = await userResponse.json()
            review.author = userData.data.username
          } else {
            review.author = "Unknown User"
          }

          review.createdAt = new Date(review.createdAt).toLocaleDateString()
          review.likesCount = review.likesCount || 0
        }

        reviews.value = reviewsData
        updateReviewStats()
      } else {
        reviews.value = []
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const updateReviewStats = () => {
    totalReviews.value = reviews.value.length

    const totalRating = reviews.value.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    )
    averageRating.value =
      reviews.value.length > 0
        ? (totalRating / reviews.value.length).toFixed(1)
        : 0
  }

  return {
    reviews,
    totalReviews,
    averageRating,
    fetchReviews,
  }
}
