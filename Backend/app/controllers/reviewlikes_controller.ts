import type { HttpContext } from '@adonisjs/core/http'

import ReviewLike from '#models/reviewlike'
import Review from '#models/ReviewsMovie'
import Movie from '#models/movie'

export default class ReviewlikesController {
  public async store({ auth, params, response }: HttpContext) {
    const user = await auth.getUserOrFail()
    const movieId = params.movieId
    const reviewId = params.reviewId
    try {
      const movie = await Movie.query().where('movieId', movieId)
      if (!movie) {
        return response.status(404).json({ message: 'Movie not found' })
      }

      const review = await Review.find(reviewId)
      if (!review) {
        return response.status(404).json({ message: 'Review not found' })
      }

      const existingLike = await ReviewLike.query()
        .where('reviewId', reviewId)
        .where('userId', user.id)
        .first()

      if (existingLike) {
        await existingLike.delete()

        return response.status(200).json({
          message: 'Review unlike successfully',
        })
      }

      const reviewLike = new ReviewLike()
      reviewLike.reviewId = reviewId
      reviewLike.userId = user.id
      reviewLike.isLiked = true
      await reviewLike.save()

      return response.status(201).json({
        message: 'Review liked successfully',
        data: reviewLike,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Failed to like review',
        error: error.message,
      })
    }
  }

  // เพิ่มฟังก์ชัน show ที่ใช้ดึงข้อมูลสถานะการ "like"
  public async show({ auth, params, response }: HttpContext) {
    const user = await auth.getUserOrFail()
    const reviewId = params.reviewId

    try {
      // ตรวจสอบว่ารีวิวมีอยู่หรือไม่
      const review = await Review.find(reviewId)
      if (!review) {
        return response.status(404).json({ message: 'Review not found' })
      }

      // ตรวจสอบสถานะการ "like"
      const reviewLike = await ReviewLike.query()
        .where('reviewId', reviewId)
        .where('userId', user.id)
        .first()

      // ถ้ามีการ "like"
      if (reviewLike) {
        return response.status(200).json({
          message: 'Review like status retrieved successfully',
          data: {
            reviewId: reviewId,
            isLiked: reviewLike.isLiked,
          },
        })
      }

      return response.status(200).json({
        message: 'Review not liked by this user',
        data: {
          reviewId: reviewId,
          isLiked: false,
        },
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Failed to retrieve like status',
        error: error.message,
      })
    }
  }

  public async destroy({ auth, params, response }: HttpContext) {
    const user = await auth.getUserOrFail()
    const reviewId = params.reviewId
    const movieId = params.movieId

    try {
      const movie = await Movie.find(movieId)
      if (!movie) {
        return response.status(404).json({ message: 'Movie not found' })
      }

      const reviewLike = await ReviewLike.query()
        .where('reviewId', reviewId)
        .where('userId', user.id)
        .first()

      if (!reviewLike) {
        return response.status(404).json({ message: 'Like not found' })
      }

      await reviewLike.delete()

      return response.status(200).json({
        message: 'Review like removed successfully',
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Failed to remove like',
        error: error.message,
      })
    }
  }
}
