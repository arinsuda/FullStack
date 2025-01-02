import { ref } from "vue";

export function useMovieApi() {
  const baseTMDB = import.meta.env.VITE_BASE_KEY;
  const apiKey = import.meta.env.VITE_API_KEY;
  const movieUrl = import.meta.env.VITE_MOVIES_URL
  const movie = ref({});
  const cast = ref([]);

  const fetchMovieDetail = async id => {
    try {
      const response = await fetch(
        `${baseTMDB}/movie/${id}?api_key=${apiKey}&language=en-US`
      )
      if (!response.ok) throw new Error("Failed to fetch movie details")
      const data = await response.json()
      movie.value = data

      await updateMovieViews(id)
    } catch (error) {
      console.error("Error fetching movie details:", error)
    }
  }

  const fetchMovieCast = async id => {
    try {
      const response = await fetch(
        `${baseTMDB}/movie/${id}/credits?api_key=${apiKey}`
      )
      if (!response.ok) throw new Error("Failed to fetch movie cast")
      const data = await response.json()
      cast.value = data.cast
    } catch (error) {
      console.error("Error fetching movie cast:", error)
    }
  }

  const updateMovieViews = async id => {
    try {
      const response = await fetch(`${movieUrl}/${id}/views`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to update movie views")
    } catch (error) {
      console.error("Error updating movie views:", error)
    }
  }

  return {
    movie,
    cast,
    fetchMovieDetail,
    fetchMovieCast,
    updateMovieViews
  };
}
