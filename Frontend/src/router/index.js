import { createRouter, createWebHistory } from "vue-router"
import LoginView from "@/views/LoginView.vue"
import RegisterView from "@/views/RegisterView.vue"
import HomeView from "@/views/HomeView.vue"
import ProfileView from "@/views/ProfileView.vue"
import CategoryView from "../views/CategoryView.vue"
import MovieView from "../views/MovieView.vue"
import TVSeriesView from "../views/TVSeriesView.vue"
import SearchResults from "../components/SearchResults.vue"
import MovieDetail from "../views/MovieDetail.vue"
import LikeView from "@/views/LikeView.vue"
import WatchlistsView from "@/views/WatchlistsView.vue"
import ReviewsView from "@/views/ReviewsView.vue"
import UpComingView from "@/views/UpComingView.vue"
import SupportView from "@/views/SupportView.vue"
import AddReviewsVue from "../components/AddReviews.vue"

const routes = [
  { path: "/", name: "RootPath", redirect: { name: "Login" } },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  { path: "/home", name: "Home", component: HomeView },
  { path: "/movie", name: "Movie", component: MovieView },
  { path: "/series", name: "Series", component: TVSeriesView },
  { path: "/upcoming", name: "Upcoming", component: UpComingView },
  { path: "/support", name: "Support", component: SupportView},
  { path: "/profile", name: "Profile", component: ProfileView },
  { path: "/category/:id", name: "Category", component: CategoryView },
  { path: "/search", name: "SearchResults", component: SearchResults },
  { path: "/movie/:id", name: "MovieDetail", component: MovieDetail, props: true },
  { path: "/users/likes", name: "Like", component: LikeView },
  { path: "/users/watchlists", name: "Watchlist", component: WatchlistsView },
  { path: "/users/reviews", name: "Reviewed", component: ReviewsView },
  { path: "/movie/:id/add", name: "AddReviews", component: AddReviewsVue, props: true }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  const payload = localStorage.getItem("payload")

  const publicRoutes = [
    "Login",
    "Register",
    "Home",
    "Movie",
    "Series",
    "Upcoming",
    "Support",
    "Category",
    "MovieDetail",
    "SearchResults",
    "Profile",
    "Like",
    "Watchlist",
    "Reviewed",
  ];

  if (token) {
    try {
      // ตรวจสอบ token ที่หมดอายุ
      const parsedPayload = JSON.parse(payload);
      const now = new Date().getTime();

      // หาก token หมดอายุ ให้ลบข้อมูลและส่งกลับไปยังหน้า Login
      if (parsedPayload.exp && now > parsedPayload.exp * 1000) {
        localStorage.removeItem("token");
        localStorage.removeItem("payload");
        alert("Your session has expired. Please log in again.");
        return next({ name: "Login" });
      }

      // หากเข้าสู่ระบบแล้วและพยายามเข้าถึงหน้า Login หรือ Register
      if (to.name === "Login" || to.name === "Register") {
        return next({ name: "Home" });
      }
    } catch (error) {
      console.error("Error parsing payload:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("payload");
      return next({ name: "Login" });
    }
  } else {
    if (!publicRoutes.includes(to.name)) {
      return next({ name: "Login" });
    }
  }

  // Proceed with navigation
  next()
})

export default router
