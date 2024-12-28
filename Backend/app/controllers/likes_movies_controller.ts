import { HttpContext } from '@adonisjs/core/http'
import LikeMovie from '#models/LikesMovie'
import { DateTime } from 'luxon'

export default class LikesMovieController {
  public async store({ auth, response, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const movieId = params.movieId

    try {
      const existingLike = await LikeMovie.query()
        .where('userId', user.id)
        .where('movieId', movieId)
        .first()

      if (existingLike) {
        await existingLike.delete()
        return response.status(200).send({
          message: 'Movie unliked successfully',
        })
      }

      const likeMovie = new LikeMovie()
      likeMovie.userId = user.id
      likeMovie.movieId = movieId
      likeMovie.likedAt = DateTime.now()

      await likeMovie.save()

      return response.status(201).send({
        message: 'Movie liked successfully',
        data: likeMovie,
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to like movie', error })
    }
  }

  public async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    
    const likedMovies = await LikeMovie.query().where('userId', user.id).orderBy('likedAt', 'desc')

    if (likedMovies) {
      return response.status(200).send({
        message: 'Liked movies fetched successfully',
        data: likedMovies,
      })
    } else {
      return response.status(404).send({
        message: `You don't have the movies you like.`,
        data: likedMovies,
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
