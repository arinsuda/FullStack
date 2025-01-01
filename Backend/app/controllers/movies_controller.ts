import Like from '#models/LikesMovie'
import Movie from '#models/movie'
import Review from '#models/ReviewsMovie'
import WatchLists from '#models/Watchlist'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  public async store({ params, response, request }: HttpContext) {
    const mediaType = request.input('mediaType', 'movie')
    const mediaId = params.id
    const apiKey = '95ceddd8abbb23b1ffb39426036b72ff'
    const tmdbBaseUrl = mediaType === 'tv'
      ? 'https://api.themoviedb.org/3/tv' 
      : 'https://api.themoviedb.org/3/movie'

    try {
      const tmdbResponse = await fetch(`${tmdbBaseUrl}/${mediaId}?api_key=${apiKey}&language=en-US`)

      if (!tmdbResponse.ok) {
        throw new Error('Failed to fetch data from TMDB')
      }

      const mediaData = await tmdbResponse.json()

      // ใช้ Movie หรือ TV model ตามประเภท
      const media = await Movie.query().where('movie_id', mediaId).first()

      if (!media) {
        const newMedia = new Movie()
        newMedia.movieId = mediaData.id
        newMedia.members = 0
        newMedia.rating = 0
        await newMedia.save()

        return response.status(201).json({
          message: 'Media created and data fetched successfully from TMDB',
          data: newMedia,
        })
      }

      return response.status(200).json({
        message: 'Media already exists',
        data: media,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Failed to create media or fetch data from TMDB',
        error: error.message,
      })
    }
  }

  public async show({ params, response, request }: HttpContext) {
    const mediaType = request.input('mediaType', 'movie') // Default is 'movie', can be 'tv'
    const mediaId = params.id
    try {
      let media = await Movie.query().where('movie_id', mediaId).firstOrFail()

      const reviewsCount = await Review.query().where('movieId', mediaId).count('* as totalReviews')
      const likesCount = await Like.query().where('movieId', mediaId).count('* as totalLikes')
      const watchlistsCount = await WatchLists.query()
        .where('movieId', mediaId)
        .count('* as totalWatchlists')

      return response.status(200).json({
        message: 'Media fetched successfully',
        data: {
          ...media.toJSON(),
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
    const mediaId = params.id
    try {
      const media = await Movie.query().where('movie_id', mediaId).first()

      if (!media) {
        return response.status(404).json({
          message: 'Media not found',
        })
      }

      media.members += 1
      await media.save()

      return response.status(200).json({
        message: 'View count updated successfully',
        media: media,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to update view count',
        error: error.message,
      })
    }
  }
}
