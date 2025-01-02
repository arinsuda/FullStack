import ReviewlikesController from '#controllers/reviewlikes_controller'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/movies/:movieId/reviews/:reviewId/like', [ReviewlikesController, 'show'])
    router.post('/movies/:movieId/reviews/:reviewId/like', [ReviewlikesController, 'store'])
    router.delete('/movies/:movieId/reviews/:reviewId/like', [ReviewlikesController, 'destroy'])
  })
  .prefix('/api')
  .use(middleware.auth())
