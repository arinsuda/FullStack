<script setup>
import { ref, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Navbar from "../components/Navbar.vue"
import Sidebar from "../components/Sidebar.vue"
import AddReviews from "../components/AddReviews.vue"
import { useMovieApi } from "../composables/useMovieApi"
import { useReviewApi } from "../composables/useReviewApi"
import EditReview from "@/components/EditReview.vue";
import ConfirmDelete from "@/components/ConfirmDelete.vue";
import heartlike from "/assets/heart-like.svg"
import heartunlike from "/assets/heart-unlike.svg"
import bookmarkfill from "/assets/bookmark-fill.svg"
import bookmark from "/assets/bookmark.svg"

const route = useRoute()
const router = useRouter()

const { movie, cast, fetchMovieDetail, fetchMovieCast, updateMovieViews } =
  useMovieApi()
const { reviews, totalReviews, averageRating, fetchReviews, userId } = useReviewApi()

//env
const categoryUrl = import.meta.env.VITE_CATEGORY_URL
const baseUrl = import.meta.env.VITE_BASE_URL
const movieUrl = import.meta.env.VITE_MOVIES_URL

const categories = ref([])

//state
const totalLikes = ref(0)
const totalSaves = ref(0)
const totalViews = ref(0)

//button
const showCast = ref(false)
const showReviewModal = ref(false)
const isLikedReview = ref(false)
const isSaved = ref(false)
const isLikedMovie = ref(false)

const updateMovieStats = async id => {
  try {
    const postResponse = await fetch(`${movieUrl}/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ movieId: id }),
    })

    if (!postResponse.ok) throw new Error("Failed to update movie ID")

    const statsResponse = await fetch(`${movieUrl}/${id}`)
    if (!statsResponse.ok) throw new Error("Failed to fetch movie stats")

    const data = await statsResponse.json()

    totalLikes.value = data.data.likesCount || 0
    totalSaves.value = data.data.watchlistsCount || 0
    totalViews.value = data.data.members || 0
    totalReviews.value = data.data.reviewsCount || 0
    averageRating.value = parseFloat(data.data.rating) || 0
    isLikedMovie.value = data.data.isLiked || false
    isSaved.value = data.data.isSaved || false

    isLikedMovie.value = data.data.isLiked || false
    isSaved.value = data.data.isSaved || false
  } catch (error) {
    console.error("Error updating movie stats:", error)
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

const fetchCategories = async () => {
  try {
    const response = await fetch(categoryUrl)
    if (!response.ok) throw new Error("Failed to fetch categories")
    const data = await response.json()
    categories.value = data.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    )
  } catch (error) {
    console.error("Error fetching categories:", error)
  }
}

const toggleCast = () => {
  showCast.value = !showCast.value
}

const openReviewModal = () => {
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
}

const mapGenreToCategory = genreName => {
  const category = categories.value.find(
    cat => cat.categoryName.toLowerCase() === genreName.toLowerCase()
  )
  return category ? category.id : null
}

const handleReviewSubmit = async ({ comment, rating }) => {
  const movieId = route.params.id
  const reviewData = { comment, rating }

  try {
    let token = JSON.parse(localStorage.getItem("token"))

    if (!token) {
      router.push({ name: "Login" })
      return
    }

    const response = await fetch(
      `${import.meta.env.VITE_MOVIES_URL}/${movieId}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      }
    )

    if (!response.ok) throw new Error("Failed to submit review")

    await fetchReviews(movieId)
    updateReviewStats()
    closeReviewModal()
  } catch (error) {
    console.error("Error submitting review:", error)
  }
}

const handleReviewLike = async reviewId => {
  const token = JSON.parse(localStorage.getItem("token"))
  const movieId = route.params.id

  try {
    const response = await fetch(
      `${movieUrl}/${movieId}/reviews/${reviewId}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (response.status === 200 || response.status === 201) {
      const index = reviews.value.findIndex(r => r.id === reviewId)
      if (index !== -1) {
        if (data.message === "Review liked successfully") {
          reviews.value[index].isLiked = true
          reviews.value[index].likesCount =
            (reviews.value[index].likesCount || 0) + 1
        } else if (data.message === "Review unlike successfully") {
          reviews.value[index].isLiked = false
          reviews.value[index].likesCount = Math.max(
            0,
            (reviews.value[index].likesCount || 0) - 1
          )
        }
      }
      fetchReviewData()
    } else {
      console.error("Error:", data.message)
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

const fetchReviewData = async reviewId => {
  const token = JSON.parse(localStorage.getItem("token"))
  const movieId = route.params.id
  try {
    const response = await fetch(
      `${baseUrl}/api/movies/${movieId}/reviews/${reviewId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.status === 200) {
      const result = await response.json()
      isLikedReview.value = result.data.isLiked
    } else {
      throw new Error("Failed to fetch review data")
    }
  } catch (error) {
    console.error("Error fetching review data:", error)
  }
}

const handleAddToWatchlist = async () => {
  const movieId = route.params.id
  const token = JSON.parse(localStorage.getItem("token"))
  try {
    const response = await fetch(`${movieUrl}/${movieId}/watchlists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    if (response.status === 201 || response.status === 200) {
      const result = await response.json()
      const { data, totalWatchlists: newTotalWatchlists } = result

      isSaved.value = data.isWatchlist
      totalSaves.value = newTotalWatchlists ?? 0

      checkUserIsStatus()
    } else if (response.status === 401) {
      router.push({ name: "Login" })
    } else {
      throw new Error("Failed to add movie to watchlist")
    }
  } catch (error) {
    console.error("Error adding movie to watchlist:", error)
  }
}

const handleMovieLike = async () => {
  const movieId = route.params.id
  const token = JSON.parse(localStorage.getItem("token"))

  try {
    const response = await fetch(`${baseUrl}/api/movies/${movieId}/likes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 201 || response.status === 200) {
      const result = await response.json()
      const { data, totalLikes: newTotalLikes } = result

      isLikedMovie.value = data.isLiked
      totalLikes.value = newTotalLikes ?? 0

      checkUserIsStatus()
    } else if (response.status === 401) {
      router.push({ name: "Login" })
    } else {
      throw new Error("Failed to like the movie")
    }
  } catch (error) {
    console.error("Error liking the movie:", error)
  }
}

//fetch Status By USER
const checkUserIsStatus = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const movieId = route.params.id

  if (!token) {
    return
  }

  const payload = JSON.parse(localStorage.getItem("payload"))
  const userId = payload.userId

  try {
    const response = await fetch(
      `${baseUrl}/users/${userId}/movies/${movieId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    if (response.status === 200) {
      const data = await response.json()
      const likedMovies = data.data.my_likes
      const movieIdLiked =
        likedMovies.length > 0 ? likedMovies[0].movieId : null
      const isLiked = likedMovies.some(
        movie => movie.movieId === movieIdLiked && movie.isLiked === 1
      )
      isLikedMovie.value = isLiked
      const watchlistedMovies = data.data.my_watchlists
      const movieIdWatchlisted =
        watchlistedMovies.length > 0 ? watchlistedMovies[0].movieId : null
      const isWatchlisted = watchlistedMovies.some(
        movie =>
          movie.movieId === movieIdWatchlisted && movie.isWatchlist === 1
      )
      isSaved.value = isWatchlisted
    }
  } catch (error) {
    console.error("Error fetching liked movies:", error)
  }
}

// State for dropdown and modal
const showDropdown = ref({})
const showEditReview = ref(false)
const reviewToEdit = ref(null)

const openEditReviws = (review) => {
  reviewToEdit.value = { ...review };
  showEditReview.value = true
}

const closeEditReviews = () => {
  showEditReview.value = false
}

// Function to handle editing a review
const updatedReviews = async (updatedData) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const movieId = route.params.id

  try {
    const response = await fetch(
      `${baseUrl}/api/movies/${movieId}/reviews/${updatedData.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: updatedData.comment,
          rating: updatedData.rating,
        }),
      }
    )

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to edit review");
    }

    // แสดงข้อความว่ารีวิวอัพเดตสำเร็จ
    console.log("Review updated successfully:", data);

    // เรียก fetchReviews เพื่อดึงข้อมูลใหม่จาก API
    await fetchReviews(movieId);

    // ปิด modal หรือ dropdown หลังจากอัพเดต
    closeEditReviews();
    showDropdown.value[updatedData.id] = false;
  } catch (error) {
    console.error("Error editing review:", error)
  }
}

// Function to handle deleting a review
const deletedReview = async (reviewId) => {
  const token = JSON.parse(localStorage.getItem("token"));
  const movieId = route.params.id;

  try {
    const response = await fetch(
      `${baseUrl}/api/movies/${movieId}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to delete review");
    await fetchReviews(movieId);
    updateReviewStats()
    closeDeleteReview()
  } catch (error) {
    console.error("Error deleting review:", error);
  }
};

const toggleDropdown = (reviewId) => {
  showDropdown.value[reviewId] = !showDropdown.value[reviewId]
}

const reviewToDelete = ref(null);
const showDeleteReviews = ref(false);

const openDeleteReview = (review) => {
  reviewToDelete.value = review.id;
  showDeleteReviews.value = true
}

const closeDeleteReview = () => {
  showDeleteReviews.value = false
}

onMounted(async () => {
  const movieId = route.params.id
  await fetchMovieDetail(movieId)
  await fetchMovieCast(movieId)
  await fetchReviews(movieId)
  await fetchCategories()
  await updateMovieStats(movieId)
  await checkUserIsStatus()
  await fetchReviewData()
})
</script>

<template>
  <div class="flex flex-col min-h-screen text-white bg-zinc-900" style="margin-top: 2rem">
    <Navbar />
    <div class="flex flex-1 pt-16">
      <Sidebar :categories="categories" />
      <main class="flex-1 p-6 ml-10">
        <!-- Movie Detail Section -->
        <div class="flex flex-col gap-8 movie-detail">
          <!-- Movie Poster and Details -->
          <div class="flex w-full gap-5 p-6">
            <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" alt="Movie Poster"
              class="w-1/4 rounded-lg shadow-lg hover:shadow-[0_0_20px_5px_rgba(255,0,0,0.7)] transition-all duration-300" />

            <div class="flex flex-col px-4 w-3/3">
              <div class="flex items-center justify-between mb-2">
                <h1
                  class="mb-2 text-3xl font-bold tracking-wide text-red-500 transition duration-300 hover:text-red-600">
                  {{ movie.title }}
                </h1>

                <!-- Like and Watchlist Buttons -->
                <div class="flex gap-4">
                  <!-- Like Button -->
                  <button @click="handleMovieLike"
                    class="p-3 transition duration-300 bg-transparent rounded-full focus:outline-none hover:scale-110">
                    <img :src="isLikedMovie
                      ? heartlike
                      : heartunlike
                      " alt="Like" class="w-6 h-6" />
                  </button>
                  <!-- Watchlist Button -->
                  <button @click="handleAddToWatchlist"
                    class="p-3 transition duration-300 bg-transparent rounded-full focus:outline-none hover:scale-110">
                    <img :src="isSaved
                      ? bookmarkfill
                      : bookmark
                      " alt="Save" class="w-8 h-8" />
                  </button>
                </div>
              </div>
              <!-- Average Rating Section -->
              <div class="flex items-center mb-4 text-yellow-400">
                <i class="mr-1 text-yellow-500 fas fa-star"></i>
                <span class="text-xl font-semibold">{{ averageRating }} </span>
              </div>

              <p class="mb-4 text-sm text-gray-400 transition duration-300 hover:text-gray-200">
                {{ movie.overview }}
              </p>
              <div class="flex flex-wrap gap-2">
                <template v-for="genre in movie.genres" :key="genre.id">
                  <router-link v-if="mapGenreToCategory(genre.name)" :to="{
                    name: 'Category',
                    params: { id: mapGenreToCategory(genre.name) },
                  }"
                    class="px-2 py-1 text-xs font-medium text-white bg-slate-700 rounded-full shadow hover:shadow-[0_0_10px_ rgba(255,255,255,0.6)] transition duration-300">
                    {{ genre.name }}
                  </router-link>
                  <span v-else class="px-2 py-1 text-xs font-medium text-red-500 rounded-full shadow bg-slate-700">
                    {{ genre.name }}
                  </span>
                </template>
              </div>
              <!-- Zone Stats -->
              <div class="grid grid-cols-2 gap-4 mt-6 text-center md:grid-cols-4">
                <div class="p-4 transition duration-300 bg-green-600 rounded-lg shadow-lg hover:shadow-xl">
                  <div class="text-2xl font-extrabold">{{ totalViews }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-200">
                    Members
                  </div>
                </div>
                <div class="p-4 transition duration-300 bg-pink-500 rounded-lg shadow-lg hover:shadow-xl">
                  <div class="text-2xl font-extrabold">{{ totalLikes }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-200">
                    Likes
                  </div>
                </div>
                <div class="p-4 transition duration-300 bg-blue-500 rounded-lg shadow-lg hover:shadow-xl">
                  <div class="text-2xl font-extrabold">{{ totalSaves }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-200">
                    Lists
                  </div>
                </div>
                <div class="p-4 transition duration-300 bg-gray-600 rounded-lg shadow-lg hover:shadow-xl">
                  <div class="text-2xl font-extrabold">{{ totalReviews }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-200">
                    Reviews
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cast Section -->
          <div class="p-6 rounded-lg shadow-xl bg-neutral-900">
            <div class="flex items-center justify-between p-2 mb-4 rounded-lg bg-zinc-950 h-14">
              <h2 class="px-6 text-2xl font-bold text-white">TOP CAST</h2>
              <button v-if="cast.length > 6" @click="toggleCast"
                class="flex items-center h-full px-6 ml-4 text-lg font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 hover:shadow-[0_0_20px_5px_rgba(255,0,0,0.7)] transition duration-300">
                {{ showCast ? "Hide Cast" : "Show All Cast" }}
              </button>
            </div>
            <div class="grid grid-cols-6 gap-4">
              <div v-for="(actor, index) in showCast ? cast : cast.slice(0, 6)" :key="actor.id"
                class="text-center group">
                <img :src="`https://image.tmdb.org/t/p/w200${actor.profile_path}`" alt="Actor"
                  class="object-cover h-20 mx-auto mb-2 transition transform rounded-full shadow-md w-20 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                <p class="text-sm text-center text-gray-200 transition duration-300 group-hover:text-white">
                  {{ actor.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="p-6 rounded-lg shadow-lg bg-neutral-900">
            <div class="flex items-center justify-between pb-2 mb-6 border-b border-gray-700">
              <h2 class="text-2xl font-semibold tracking-wide text-white">
                Reviews
              </h2>
              <button @click="openReviewModal"
                class="px-4 py-2 text-sm font-bold text-white transition duration-300 rounded-lg hover:scale-110 bg-gradient-to-r focus:ring-2 focus:ring-red-500 from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                + Write a Review
              </button>
            </div>

            <div v-if="reviews.length === 0" class="text-center">
              <p class="mb-10 text-gray-400">
                No reviews yet. Be the first to write one!
              </p>
            </div>

            <div v-else class="space-y-6">
              <div v-for="review in reviews" :key="review.id"
                class="p-6 border border-gray-700 rounded-lg shadow-md bg-zinc-800 hover:scale-105 focus:ring-2 focus:ring-red-500 hover:shadow-[0_0_20px_5px_rgba(255,0,0,0.7)] transition duration-300">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">

                    <div v-if="review.user.id === userId" class="relative">
                      <button @click="toggleDropdown(review.id)"
                        class="p-2 px-4 text-gray-400 transition duration-500 rounded-full hover:text-white hover:bg-gray-600">
                        ⋮
                      </button>

                      <div v-show="showDropdown[review.id]" class="absolute w-40 rounded-lg shadow-md bg-zinc-900">
                        <button @click="openEditReviws(review)"
                          class="block w-full px-4 py-2 text-sm text-left text-white hover:bg-zinc-500 rounded-xl">
                          Edit
                        </button>
                        <button @click="openDeleteReview(review)"
                          class="block w-full px-4 py-2 text-sm text-left text-red-600 duration-500 hover:bg-red-500 hover:text-white rounded-xl">
                          Delete
                        </button>
                      </div>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-100">
                      {{ review.user.username }}
                    </h3>
                  </div>
                  <span class="text-sm text-gray-400">{{ review.createdAt }}</span>
                </div>

                <p class="mb-4 text-gray-300">{{ review.comment }}</p>
                <div class="flex items-center justify-between mt-4">
                  <button @click="handleReviewLike(review.id)"
                    class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition bg-red-500 rounded-lg shadow-md hover:scale-105 hover:bg-red-600 focus:ring-2 focus:ring-red-400">
                    <i :class="review.isLiked ? 'fas fa-heart' : 'far fa-heart'" class="text-lg"></i>
                    <span class="ml-2">{{ review.likesCount }}</span>
                  </button>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-yellow-400">Rating: {{ review.rating }} / 10</span>
                    <div class="flex gap-1">
                      <i v-for="n in 10" :key="n" class="fas" :class="n <= review.rating
                        ? 'fa-star text-yellow-500'
                        : 'fa-star text-gray-500'"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <AddReviews :id="route.params.id" :isOpen="showReviewModal" @close="closeReviewModal"
      @submit="handleReviewSubmit" />
    <EditReview :isOpen="showEditReview" :review="reviewToEdit" @save="updatedReviews" @close="closeEditReviews" />
    <ConfirmDelete :isOpen="showDeleteReviews" @confirm="deletedReview(reviewToDelete)" @close="closeDeleteReview" />
  </div>
</template>

<style scoped>
.movie-detail {
  max-width: 70%;
  margin: 0 auto;
}

.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

.fixed {
  transition: right 0.3s ease;
}
</style>
