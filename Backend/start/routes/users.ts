import UsersController from '#controllers/users_controller'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import LikesMovieController from '#controllers/likes_movies_controller'
import WatchlistsController from '#controllers/watchlists_controller'

router
  .group(() => {
    router.get('/users/likes', [LikesMovieController, 'index'])
    router.put('/users/:id', [UsersController, 'edit']).as('users.edit')
    router.get('/users/watchlists', [WatchlistsController, 'index'])
    router.post('/api/movies/:movieId/likes', [LikesMovieController, 'store'])
    router.post('/api/movies/:movieId/watchlists', [WatchlistsController, 'store'])
  })
  .use(middleware.auth())

router.group(() => {
  router.post('/login', [UsersController, 'login']).as('users.login')
  router.post('/register', [UsersController, 'register']).as('users.register')
  router.get('/users/:id', [UsersController, 'show'])
})
