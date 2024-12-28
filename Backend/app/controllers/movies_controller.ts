import Like from '#models/LikesMovie'
import Movie from '#models/movie'
import Review from '#models/ReviewsMovie'
import WatchLists from '#models/Watchlist'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  public async store({ params, response }: HttpContext) {
    const movieId = params.id
    const apiKey = '95ceddd8abbb23b1ffb39426036b72ff'
    const tmdbBaseUrl = 'https://api.themoviedb.org/3/movie'

    try {
      const tmdbResponse = await fetch(`${tmdbBaseUrl}/${movieId}?api_key=${apiKey}&language=en-US`)

      if (!tmdbResponse.ok) {
        throw new Error('Failed to fetch movie data from TMDB')
      }

      const movieData = await tmdbResponse.json()

      const movie = await Movie.query().where('movie_id', movieId).first()

      if (!movie) {
        const newMovie = new Movie()
        newMovie.movieId = movieData.id
        newMovie.members = 0
        newMovie.rating = 0
        await newMovie.save()
        return response.status(201).json({
          message: 'Movie created and data fetched successfully from TMDB',
          data: newMovie,
        })
      }

      return response.status(200).json({
        message: 'Movie already exists',
        data: movie,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Failed to create movie or fetch data from TMDB',
        error: error.message,
      })
    }
  }

  public async show({ params, response }: HttpContext) {
    const movieId = params.id
    try {
      let movie = await Movie.query().where('movie_id', movieId).firstOrFail()

      await movie.save()

      const reviewsCount = await Review.query().where('movieId', movieId).count('* as totalReviews')
      const likesCount = await Like.query().where('movieId', movieId).count('* as totalLikes')
      const watchlistsCount = await WatchLists.query()
        .where('movieId', movieId)
        .count('* as totalWatchlists')

      return response.status(200).json({
        message: 'Movie fetched successfully',
        data: {
          ...movie.toJSON(),
          reviewsCount: reviewsCount[0].$extras.totalReviews || 0,
          likesCount: likesCount[0].$extras.totalLikes || 0,
          watchlistsCount: watchlistsCount[0].$extras.totalWatchlists || 0,
        },
      })
    } catch (error) {
      return response.status(404).json({
        message: error.message,
        error: error,
      })
    }
  }

  public async incrementViewAndCheck({ params, response }: HttpContext) {
    const movieId = params.id

    try {
      const movie = await Movie.query().where('movie_id', movieId).first()

      if (!movie) {
        return response.status(404).json({
          message: 'Movie not found',
        })
      }

      movie.members += 1
      await movie.save()

      return response.status(200).json({
        message: 'View count updated successfully',
        movie: movie,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to update view count',
        error: error.message,
      })
    }
  }
}
