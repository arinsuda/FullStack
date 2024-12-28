import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'
import Role from '../contact/role.js'

export default class CategoriesController {
  async store({ auth, request, response }: HttpContext) {

    const user = await auth.authenticate()
    if (user.role !== Role.ADMIN) {
      return response.status(403).json({
        message: 'Forbidden: You do not have permission to create a movie',
      })
    }

    const data = request.only(['category_name'])
    const category = await Category.create(data)
    return response.status(201).json(category)
  }

  async index({ response }: HttpContext) {
    const categories = await Category.all()
    return response.status(200).json(categories)
  }

  async show({ params, response }: HttpContext) {
    const category = await Category.query().where('id', params.id).preload('movies')
    if (!category) {
      return response.status(404).json({ message: 'Category not found' })
    }
    return response.status(200).json(category)
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = await auth.authenticate()
    if (user.role !== Role.ADMIN) {
      return response.status(403).json({
        message: 'Forbidden: You do not have permission to create a movie',
      })
    }

    const category = await Category.find(params.id)
    if (!category) {
      return response.status(404).json({ message: 'Category not found' })
    }

    const data = request.only(['category_name'])
    category.merge(data)
    await category.save()

    return response.status(200).json(category)
  }

  async destroy({ auth, params, response }: HttpContext) {

    const user = await auth.authenticate()
    if (user.role !== Role.ADMIN) {
      return response.status(403).json({
        message: 'Forbidden: You do not have permission to create a movie',
      })
    }

    const category = await Category.find(params.id)
    if (!category) {
      return response.status(404).json({ message: 'Category not found' })
    }
    await category.delete()
    return response.status(200).json({ message: 'Category deleted successfully' })
  }
}
