import Category from '#models/category'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Category.createMany([
      { category_name: 'Action' },
      { category_name: 'Adventure' },
      { category_name: 'Animation' },
      { category_name: 'Comedy' },
      { category_name: 'Crime' },
      { category_name: 'Drama' },
      { category_name: 'Fantasy' },
      { category_name: 'Horror' },
      { category_name: 'Mystery' },
      { category_name: 'Romance' },
      { category_name: 'Sci-Fi' },
      { category_name: 'Thriller' },
      { category_name: 'Documentary' },
      { category_name: 'Biography' },
    ])
  }
}