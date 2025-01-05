import type { HttpContext } from '@adonisjs/core/http'

import Movie from '#models/movie'
import Review from '#models/ReviewsMovie'
import { createReviewValidator } from '#validators/reviews'

export default class ReviewsController {
  public async store({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const movie_id = params.movieId
      const payload = await request.validateUsing(createReviewValidator)

      const review = new Review()
      review.userId = user.id
      review.movieId = movie_id
      review.rating = payload.rating
      review.comment = payload.comment

      await review.save()

      const reviews = await Review.query().where('movieId', movie_id)

      let totalRating = 0
      let reviewCount = reviews.length

      reviews.forEach((r) => {
        totalRating += r.rating
      })

      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0

      // Step 3: อัพเดตค่า Average Rating ใน Movie Model
      const movie = await Movie.findByOrFail('movieId', movie_id)
      movie.rating = averageRating

      await movie.save()

      return response.status(201).send({
        message: 'Review created successfully',
        data: review,
      })
    } catch (error) {
      console.error(error)
      return response.status(400).send({ message: 'Failed to create review', error })
    }
  }

public async indexMovie({ params, response }: HttpContext) {
    const movieId = params.movieId
    try {
      const reviews = await Review.query()
        .where('movieId', movieId)
        .preload('user')
        .withCount('likes') 

      return response.status(200).send({
        message: 'Reviews fetched successfully',
        data: reviews.map(review => ({
          ...review.$attributes,
          likesCount: review.$extras.likes_count || 0,
          user: review.user,
        })),
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to fetch reviews', error })
    }
  }

  public async indexUser({ params, response }: HttpContext) {
    try {
      const userId = params.userId
      const reviews = await Review.query().where('userId', userId).preload('likes')
      
      return response.status(200).send({
        message: 'Reviews fetched successfully',
        data: reviews,
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to fetch reviews', error })
    }
  }

  public async showInMovie({ params, response }: HttpContext) {
    const movieId = params.movieId
    const reviewId = params.reviewId

    try {
      const review = await Review.query()
        .where('movieId', movieId)
        .where('id', reviewId)
        .withCount('likes')

      return response.status(200).send({
        message: 'Review fetched successfully',
        data: review.map(review => ({
          ...review.$attributes,
          likesCount: review.$extras.likes_count || 0
        })),
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to fetch review', error })
    }
  }

  public async showInUser({ params, response }: HttpContext) {
    const userId = params.userId
    const reviewId = params.reviewId

    try {
      const review = await Review.query()
        .where('userId', userId)
        .where('id', reviewId)
        .preload('likes')

      return response.status(200).send({
        message: 'Review fetched successfully',
        data: { review },
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to fetch review', error })
    }
  }

  public async update({ auth, params, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const movieId = params.movieId
    const reviewId = params.reviewId
  
    try {
      const payload = await request.validateUsing(createReviewValidator)
  
      const movie = await Movie.query().where('movieId', movieId).first()
      if (!movie) {
        return response.status(404).send({ message: 'Movie not found' })
      }
  
      const review = await Review.find(reviewId)
      if (!review) {
        return response.status(404).send({ message: 'Review not found' })
      }
  
      if (review.userId !== user.id) {
        return response.status(403).send({ message: 'You can only update your own review' })
      }
  
      // อัพเดตรีวิว
      review.rating = payload.rating || review.rating
      review.comment = payload.comment || review.comment
      await review.save()
  
      // คำนวณคะแนนเฉลี่ยใหม่ของ movie
      const reviews = await Review.query().where('movieId', movieId)
      let totalRating = 0
      reviews.forEach((r) => {
        totalRating += r.rating
      })
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0
  
      // อัพเดตคะแนนใน movie
      movie.rating = averageRating
      await movie.save()
  
      return response.status(200).send({
        message: 'Review updated successfully',
        data: review,
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to update review', error })
    }
  }
  

  public async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const movieId = params.movieId
      const reviewId = params.reviewId

      const movie = await Movie.query().where('movieId', movieId).first()
      if (!movie) {
        return response.status(404).send({ message: 'Movie not found' })
      }

      const review = await Review.find(reviewId)

      if (!review) {
        return response.status(404).send({ message: 'Review not found' })
      }

      if (review.userId !== user.id) {
        return response.status(403).send({ message: 'You can only delete your own review' })
      }

      await review.delete()

            // คำนวณคะแนนเฉลี่ยใหม่ของ movie
            const reviews = await Review.query().where('movieId', movieId)
            let totalRating = 0
            reviews.forEach((r) => {
              totalRating += r.rating
            })
            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0
        
            // อัพเดตคะแนนใน movie
            movie.rating = averageRating
            await movie.save()

      return response.status(200).send({
        message: 'Review deleted successfully',
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to delete review', error })
    }
  }
}
