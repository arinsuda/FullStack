import MoviesController from "#controllers/movies_controller";
import router from "@adonisjs/core/services/router";

router.group(() => {
    router.group(() => {
        router.get('/movies/:id', [MoviesController, 'show'])
        router.post('/movies/:id', [MoviesController, 'store'])
        router.patch('/movies/:id/views', [MoviesController, 'incrementViewAndCheck'])
    })
})
.prefix('/api')
