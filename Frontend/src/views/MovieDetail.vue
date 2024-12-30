<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import Sidebar from "../components/Sidebar.vue";
import AddReviews from "../components/AddReviews.vue";

//router
const route = useRoute();
const router = useRouter();

//env
const categoryUrl = import.meta.env.VITE_CATEGORY_URL;
const apiKey = import.meta.env.VITE_API_KEY;
const baseTMDB = import.meta.env.VITE_BASE_KEY;
const baseUrl = import.meta.env.VITE_BASE_URL;
const movieUrl = import.meta.env.VITE_MOVIES_URL;

const categories = ref([]);
const movie = ref({});
const cast = ref([]);
const reviews = ref([]);

//state
const totalLikes = ref(0);
const totalSaves = ref(0);
const totalViews = ref(0);
const totalReviews = ref(0);
const averageRating = ref(0);

//button
const showCast = ref(false);
const showReviewModal = ref(false);
const isLikedReview = ref(false);
const isSaved = ref(false);
const isLikedMovie = ref(false);

const fetchMovieDetail = async (id) => {
  try {
    const response = await fetch(
      `${baseTMDB}/movie/${id}?api_key=${apiKey}&language=en-US`
    );
    if (!response.ok) throw new Error("Failed to fetch movie details");
    const data = await response.json();
    movie.value = data;

    await updateMovieViews(id);
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
};

const updateMovieViews = async (id) => {
  try {
    const response = await fetch(`${movieUrl}/${id}/views`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to update movie views");
  } catch (error) {
    console.error("Error updating movie views:", error);
  }
};

const updateMovieStats = async (id) => {
  try {
    const postResponse = await fetch(`${movieUrl}/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ movieId: id }),
    });

    if (!postResponse.ok) throw new Error("Failed to update movie ID");

    const statsResponse = await fetch(`${movieUrl}/${id}`);
    if (!statsResponse.ok) throw new Error("Failed to fetch movie stats");

    const data = await statsResponse.json();

    totalLikes.value = data.data.likesCount || 0;
    totalSaves.value = data.data.watchlistsCount || 0;
    totalViews.value = data.data.members || 0;
    totalReviews.value = data.data.reviewsCount || 0;
    averageRating.value = parseFloat(data.data.rating) || 0;
    isLikedMovie.value = data.data.isLiked || false;
    isSaved.value = data.data.isSaved || false;

    isLikedMovie.value = data.data.isLiked || false;
    isSaved.value = data.data.isSaved || false;
  } catch (error) {
    console.error("Error updating movie stats:", error);
  }
};

const fetchMovieCast = async (id) => {
  try {
    const response = await fetch(
      `${baseTMDB}/movie/${id}/credits?api_key=${apiKey}`
    );
    if (!response.ok) throw new Error("Failed to fetch movie cast");
    const data = await response.json();
    cast.value = data.cast;
  } catch (error) {
    console.error("Error fetching movie cast:", error);
  }
};

const fetchReviews = async (id) => {
  try {
    const response = await fetch(`${movieUrl}/${id}/reviews`);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.data) {
      const reviewsData = data.data;

      for (let review of reviewsData) {
        const userResponse = await fetch(`${baseUrl}/users/${review.userId}`);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          review.author = userData.data.username;
        } else {
          review.author = "Unknown User";
        }

        review.createdAt = new Date(review.createdAt).toLocaleDateString();
      }

      reviews.value = reviewsData;
    } else {
      reviews.value = [];
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetch(categoryUrl);
    if (!response.ok) throw new Error("Failed to fetch categories");
    const data = await response.json();
    categories.value = data.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

const toggleCast = () => {
  showCast.value = !showCast.value;
};

const openReviewModal = () => {
  showReviewModal.value = true;
};

const closeReviewModal = () => {
  showReviewModal.value = false;
};

const mapGenreToCategory = (genreName) => {
  const category = categories.value.find(
    (cat) => cat.categoryName.toLowerCase() === genreName.toLowerCase()
  );
  return category ? category.id : null;
};

const handleReviewSubmit = async ({ comment, rating }) => {
  const movieId = route.params.id;
  const reviewData = { comment, rating };

  try {
    let token = JSON.parse(localStorage.getItem("token"));

    if (!token) {
      router.push({ name: "Login" });
      return;
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
    );

    if (!response.ok) throw new Error("Failed to submit review");

    await fetchReviews(movieId);
    closeReviewModal();
  } catch (error) {
    console.error("Error submitting review:", error);
  }
};

const handleReviewLike = async (reviewId) => {
  const token = JSON.parse(localStorage.getItem("token"));
  try {
    const response = await fetch(`${movieUrl}/reviews/${reviewId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 201) {
      isLikedReview.value = !isLikedReview.value;
      const updatedReview = await response.json();
      const index = reviews.value.findIndex((r) => r.id === reviewId);
      if (index !== -1) {
        reviews.value[index].likes = updatedReview.likes;
      }
    } else if (response.status === 401) {
      router.push({ name: "Login" });
    } else {
      throw new Error("Failed to like the review");
    }
  } catch (error) {
    console.error("Error liking the review:", error);
  }
};

const handleAddToWatchlist = async () => {
  const movieId = route.params.id;
  const token = JSON.parse(localStorage.getItem("token"));
  try {
    const response = await fetch(`${movieUrl}/${movieId}/watchlists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 201 || response.status === 200) {
      const result = await response.json();
      const { data, totalWatchlists: newTotalWatchlists } = result;

      isSaved.value = data.isWatchlist;
      totalSaves.value = newTotalWatchlists ?? 0;

      checkUserIsStatus();
    } else if (response.status === 401) {
      router.push({ name: "Login" });
    } else {
      throw new Error("Failed to add movie to watchlist");
    }
  } catch (error) {
    console.error("Error adding movie to watchlist:", error);
  }
};

const handleMovieLike = async () => {
  const movieId = route.params.id;
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const response = await fetch(`${baseUrl}/api/movies/${movieId}/likes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 201 || response.status === 200) {

      const result = await response.json();
      const { data, totalLikes: newTotalLikes } = result;

      isLikedMovie.value = data.isLiked;
      totalLikes.value = newTotalLikes ?? 0;

      checkUserIsStatus();
    } else if (response.status === 401) {
      router.push({ name: "Login" });
    } else {
      throw new Error("Failed to like the movie");
    }
  } catch (error) {
    console.error("Error liking the movie:", error);
  }
};

//fetch Status By USER
const checkUserIsStatus = async () => {
  const token = JSON.parse(localStorage.getItem('token'));

  if (!token) {
    // console.log('No token found');
    return;
  }

  const payload = JSON.parse(localStorage.getItem('payload'))
  const userId = payload.userId

  try {
    const response = await fetch(`${baseUrl}/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      const data = await response.json();

      // Check isLiked
      const likedMovies = data.data.my_likes;
      const movieIdLiked = likedMovies.length > 0 ? likedMovies[0].movieId : null;
      const isLiked = likedMovies.some(
        (movie) => movie.movieId === movieIdLiked && movie.isLiked === 1
      );
      isLikedMovie.value = isLiked;

      // Check isWatchlisted
      const watchlistedMovies = data.data.my_watchlists;
      const movieIdWatchlisted = watchlistedMovies.length > 0 ? watchlistedMovies[0].movieId : null;
      const isWatchlisted = watchlistedMovies.some(
        (movie) => movie.movieId === movieIdWatchlisted && movie.isWatchlist === 1
      );
      isSaved.value = isWatchlisted;
      console.log(isSaved.value);
    }
  } catch (error) {
    console.error("Error fetching liked movies:", error);
  }
};

// watch([totalLikes, totalSaves, totalReviews], async () => {
//   const movieId = route.params.id
//   await updateMovieStats(movieId)
// })

onMounted(async () => {
  const movieId = route.params.id;
  await fetchMovieDetail(movieId);
  await fetchMovieCast(movieId);
  await fetchReviews(movieId);
  await fetchCategories();
  await updateMovieStats(movieId);
  await checkUserIsStatus();
});
</script>

<template>
  <div
    class="flex flex-col min-h-screen text-white bg-zinc-900"
    style="margin-top: 2rem"
  >
    <Navbar />

    <div class="flex flex-1 pt-16">
      <Sidebar :categories="categories" />

      <main class="flex-1 p-6 ml-10">
        <!-- Movie Detail Section -->
        <div class="flex flex-col gap-8 movie-detail">
          <!-- Movie Poster and Details -->
          <div class="flex w-full gap-5 p-6">
            <img
              :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
              alt="Movie Poster"
              class="w-1/4 rounded-lg shadow-lg hover:shadow-[0_0_20px_5px_rgba(255,0,0,0.7)] transition-all duration-300"
            />

            <div class="flex flex-col w-3/3 px-4">
              <div class="flex items-center justify-between mb-2">
                <h1
                  class="mb-2 text-3xl font-bold tracking-wide text-red-500 transition duration-300 hover:text-red-600"
                >
                  {{ movie.title }}
                </h1>

                <!-- Like and Watchlist Buttons -->
                <div class="flex gap-4">
                  <!-- Like Button -->
                  <button
                    @click="handleMovieLike"
                    class="p-3 transition duration-300 bg-transparent rounded-full focus:outline-none hover:scale-110"
                  >
                    <img
                      :src="
                        isLikedMovie
                          ? '/src/assets/heart-like.svg'
                          : '/src/assets/heart-unlike.svg'
                      "
                      alt="Like"
                      class="w-6 h-6"
                    />
                  </button>
                  <!-- Watchlist Button -->
                  <button
                    @click="handleAddToWatchlist"
                    class="p-3 transition duration-300 bg-transparent rounded-full focus:outline-none hover:scale-110"
                  >
                    <img
                      :src="
                        isSaved
                          ? '/src/assets/bookmark-fill.svg'
                          : '/src/assets/bookmark.svg'
                      "
                      alt="Save"
                      class="w-8 h-8"
                    />
                  </button>
                </div>
              </div>

              <!-- Average Rating Section -->
              <div class="flex items-center mb-4 text-yellow-400">
                <i class="mr-1 text-yellow-500 fas fa-star"></i>
                <span class="text-xl font-semibold">{{ averageRating }} </span>
              </div>

              <p
                class="mb-4 text-sm text-gray-400 transition duration-300 hover:text-gray-200"
              >
                {{ movie.overview }}
              </p>
              <div class="flex flex-wrap gap-2">
                <template v-for="genre in movie.genres" :key="genre.id">
                  <router-link
                    v-if="mapGenreToCategory(genre.name)"
                    :to="{
                      name: 'Category',
                      params: { id: mapGenreToCategory(genre.name) },
                    }"
                    class="px-2 py-1 text-xs font-medium text-white bg-slate-700 rounded-full shadow hover:shadow-[0_0_10px_ rgba(255,255,255,0.6)] transition duration-300"
                  >
                    {{ genre.name }}
                  </router-link>
                  <span
                    v-else
                    class="px-2 py-1 text-xs font-medium text-red-500 rounded-full shadow bg-slate-700"
                  >
                    {{ genre.name }}
                  </span>
                </template>
              </div>
              <!-- Zone Stats -->
              <div
                class="grid grid-cols-2 gap-4 mt-6 text-center md:grid-cols-4"
              >
                <div
                  class="p-4 transition duration-300 bg-green-600 rounded-lg shadow-lg hover:shadow-xl"
                >
                  <div class="text-2xl font-extrabold">{{ totalViews }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-200">
                    Members
                  </div>
                </div>
                <div
                  class="p-4 transition duration-300 bg-pink-500 rounded-lg shadow-lg hover:shadow-xl"
                >
                  <div class="text-2xl font-extrabold">{{ totalLikes }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-200">
                    Likes
                  </div>
                </div>
                <div
                  class="p-4 transition duration-300 bg-blue-500 rounded-lg shadow-lg hover:shadow-xl"
                >
                  <div class="text-2xl font-extrabold">{{ totalSaves }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-200">
                    Lists
                  </div>
                </div>
                <div
                  class="p-4 transition duration-300 bg-gray-600 rounded-lg shadow-lg hover:shadow-xl"
                >
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
            <div
              class="flex items-center justify-between p-2 mb-4 rounded-lg bg-zinc-950 h-14"
            >
              <h2 class="px-6 text-2xl font-bold text-white">TOP CAST</h2>
              <button
                v-if="cast.length > 6"
                @click="toggleCast"
                class="flex items-center h-full px-6 ml-4 text-lg font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 hover:shadow-[0_0_20px_5px_rgba(255,0,0,0.7)] transition duration-300"
              >
                {{ showCast ? "Hide Cast" : "Show All Cast" }}
              </button>
            </div>
            <div class="grid grid-cols-6 gap-4">
              <div
                v-for="(actor, index) in showCast ? cast : cast.slice(0, 6)"
                :key="actor.id"
                class="text-center group"
              >
                <img
                  :src="`https://image.tmdb.org/t/p/w200${actor.profile_path}`"
                  alt="Actor"
                  class="object-cover h-20 mx-auto mb-2 transition transform rounded-full shadow-md w-20 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                />
                <p
                  class="text-sm text-center text-gray-200 transition duration-300 group-hover:text-white"
                >
                  {{ actor.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="p-6 rounded-lg shadow-lg bg-neutral-900">
            <div
              class="flex items-center justify-between pb-2 mb-6 border-b border-gray-700"
            >
              <h2 class="text-2xl font-semibold tracking-wide text-white">
                Reviews
              </h2>
              <button
                @click="openReviewModal"
                class="px-4 py-2 text-sm font-bold text-white transition duration-300 rounded-lg hover:scale-110 bg-gradient-to-r focus:ring-2 focus:ring-red-500 from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                + Write a Review
              </button>
            </div>

            <div v-if="reviews.length === 0" class="text-center">
              <p class="mb-10 text-gray-400">
                No reviews yet. Be the first to write one!
              </p>
            </div>

            <div v-else class="space-y-6">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="p-6 border border-gray-700 rounded-lg shadow-md bg-zinc-800 hover:scale-105 focus:ring-2 focus:ring-red-500 hover:shadow-[0_0_20px_5px_rgba(255,0,0,0.7)] transition duration-300"
              >
                <!-- Header: Author and Date -->
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-2xl font-bold text-gray-100">
                    {{ review.user.username }}
                  </h3>
                  <span class="text-sm text-gray-400">{{
                    review.createdAt
                  }}</span>
                </div>

                <!-- Review Comment -->
                <p class="mb-4 text-gray-300">{{ review.comment }}</p>

                <!-- Like Button and Rating -->
                <div class="flex items-center justify-between">
                  <!-- Like Button -->
                  <button
                    @click="handleReviewLike(review.id)"
                    class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition bg-red-500 rounded-lg shadow-md hover:scale-105 hover:bg-red-600 focus:ring-2 focus:ring-red-400"
                  >
                    <i
                      :class="isLikedReview ? 'fas fa-heart' : 'far fa-heart'"
                      class="text-lg"
                    ></i>
                    <span>{{ isLikedReview ? "Liked" : "Like" }}</span>
                  </button>

                  <!-- Rating Stars -->
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-yellow-400"
                      >Rating: {{ review.rating }} / 5</span
                    >
                    <div class="flex gap-1">
                      <i
                        v-for="n in 5"
                        :key="n"
                        class="fas"
                        :class="
                          n <= review.rating
                            ? 'fa-star text-yellow-500'
                            : 'fa-star text-gray-500'
                        "
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <AddReviews
      :id="route.params.id"
      :isOpen="showReviewModal"
      @close="closeReviewModal"
      @submit="handleReviewSubmit"
    />
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
