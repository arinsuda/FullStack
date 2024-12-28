import CategoriesController from "#controllers/categories_controller";
import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.group(() => {
    router.group(() => {
        router.get('/categories', [CategoriesController, 'index'])
        router.get('/categories/:id', [CategoriesController, 'show'])
    })
})
.prefix('/api')

router.group(() => {
    router.group(() => {
        router.post('/categories', [CategoriesController, 'store'])
        router.put('/categories/:id', [CategoriesController, 'update'])
        router.delete('/categories/:id', [CategoriesController, 'destroy'])
    })
})
.prefix('/api')
.use(middleware.auth())