import { HttpContext } from '@adonisjs/core/http'
import WatchLists from '#models/Watchlist'
import { DateTime } from 'luxon'

export default class WatchlistsController {
  public async store({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const movieId = params.movieId

    try {
      // ตรวจสอบว่า movieId ของผู้ใช้คนนี้มีอยู่ใน watchlist หรือไม่
      const existingWatchlist = await WatchLists.query()
        .where('userId', user.id)
        .where('movieId', movieId)
        .first()

      if (existingWatchlist) {
        existingWatchlist.isWatchlist = false
        await existingWatchlist.delete()

        const totalWatchlists = await WatchLists.query()
          .where('movieId', movieId)
          .where('is_watchlist', true)
          .count('* as totalWatchlists')

        return response.status(200).send({
          message: 'Watchlist item removed successfully',
          data: existingWatchlist,
          totalWatchlists: totalWatchlists[0].$extras.totalWatchlists,
        })
      }
      // ถ้ายังไม่มี, เพิ่มเข้าไปใน watchlist
      const watchlist = new WatchLists()
      watchlist.userId = user.id
      watchlist.movieId = movieId
      watchlist.isWatchlist = true
      watchlist.status = 'TO_WATCH'
      watchlist.addedAt = DateTime.now().toFormat('yyyy-LL-dd HH:mm:ss')

      await watchlist.save()

      const totalWatchlists = await WatchLists.query()
        .where('movieId', movieId)
        .where('is_watchlist', true)
        .count('* as totalWatchlists')

      return response.status(201).send({
        message: 'Watchlist item created successfully',
        data: watchlist,
        totalWatchlists: totalWatchlists[0].$extras.totalWatchlists,
      })
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Failed to create or remove watchlist item', error })
    }
  }

  public async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    try {
      const watchlists = await WatchLists.query()
        .where('userId', user.id)
        .orderBy('addedAt', 'desc')

      return response.status(200).send({
        message: 'Watchlist fetched successfully',
        data: watchlists,
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to fetch watchlist', error })
    }
  }

  public async update({ auth, params, request, response }: HttpContext) {
    try {
      // รับข้อมูลของผู้ใช้ที่เข้าสู่ระบบ
      const user = await auth.authenticate()
      const movieId = params.movieId
      const payload = request.only(['status'])

      // ตรวจสอบสถานะที่ส่งมา
      if (!['TO_WATCH', 'WATCHED'].includes(payload.status)) {
        return response.status(400).send({ message: 'Invalid status value' })
      }

      // ค้นหา watchlist ของผู้ใช้และ movieId ที่กำหนด
      const watchlist = await WatchLists.query()
        .where('user_id', user.id)
        .andWhere('movie_id', movieId)
        .firstOrFail()

      // อัปเดตสถานะ
      watchlist.status = payload.status
      await watchlist.save()

      return response.status(200).send({
        message: 'Watchlist updated successfully',
        data: watchlist,
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to update watchlist', error: error.message })
    }
  }

  public async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const watchlistId = params.id

    try {
      const watchlist = await WatchLists.findOrFail(watchlistId)

      if (watchlist.userId !== user.id) {
        return response
          .status(403)
          .send({ message: 'You can only delete your own watchlist items' })
      }

      await watchlist.delete()

      return response.status(200).send({
        message: 'Watchlist deleted successfully',
      })
    } catch (error) {
      return response.status(400).send({ message: 'Failed to delete watchlist', error })
    }
  }
}
