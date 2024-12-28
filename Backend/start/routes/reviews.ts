import ReviewsController from '#controllers/reviews_controller'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/movies/:movieId/reviews', [ReviewsController, 'indexMovie'])
    router.get('/movies/:movieId/reviews/:reviewId', [ReviewsController, 'showInMovie'])
  })
  .prefix('/api')

router
  .group(() => {
    router.get('/users/:userId/reviews', [ReviewsController, 'indexUser'])
    router.get('/users/:userId/reviews/:reviewId', [ReviewsController, 'showInUser'])
    router.post('/movies/:movieId/reviews', [ReviewsController, 'store'])
    router.put('/movies/:movieId/reviews/:reviewId', [ReviewsController, 'update'])
    router.delete('/movies/:movieId/reviews/:reviewId', [ReviewsController, 'destroy'])
  })
  .prefix('/api')
  .use(middleware.auth())
