import { HttpContext } from '@adonisjs/core/http'
import LikeMovie from '#models/LikesMovie'
import { DateTime } from 'luxon'

export default class LikesMovieController {
  public async store({ auth, response, params }: HttpContext) {
    const user = await auth.getUserOrFail()
    const movieId = params.movieId

    try {
      let likeMovie = await LikeMovie.query()
        .where('user_id', user.id)
        .where('movie_id', movieId)
        .first()

      if (likeMovie) {
        likeMovie.isLiked = false
        await likeMovie.delete()

        const totalLikes = await LikeMovie.query()
          .where('movie_id', movieId)
          .where('isLiked', true)
          .count('* as totalLikes')

        return response.status(200).send({
          message: 'Movie unliked successfully',
          data: likeMovie,
          totalLikes: totalLikes[0].$extras.totalLikes,
        })
      }

      // Create a new like entry if it doesn't exist
      likeMovie = new LikeMovie()
      likeMovie.userId = user.id
      likeMovie.movieId = movieId
      likeMovie.isLiked = true
      likeMovie.likedAt = DateTime.now()

      await likeMovie.save()

      const totalLikes = await LikeMovie.query()
        .where('movie_id', movieId)
        .where('isLiked', true)
        .count('* as totalLikes')

      return response.status(201).send({
        message: 'Movie liked successfully',
        data: likeMovie,
        totalLikes: totalLikes[0].$extras.totalLikes,
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to like/unlike movie', error })
    }
  }

  public async index({ auth, response }: HttpContext) {
    const user = await auth.getUserOrFail()

    try {
      const likedMovies = await LikeMovie.query()
        .where('user_id', user.id)
        .where('is_liked', true)
        .orderBy('liked_at', 'desc')

      return response.status(200).send({
        message: 'Liked movies fetched successfully',
        data: likedMovies,
      })
    } catch (error) {
      return response.status(400).send({
        message: 'Failed to fetch liked movies',
        error,
      })
    }
  }

  public async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const likeId = params.id

    try {
      const likeMovie = await LikeMovie.findOrFail(likeId)

      if (likeMovie.userId !== user.id) {
        return response.status(403).send({ message: 'You can only remove your own likes' })
      }

      await likeMovie.delete()

      return response.status(200).send({
        message: 'Like removed successfully',
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to remove like', error })
    }
  }
}
