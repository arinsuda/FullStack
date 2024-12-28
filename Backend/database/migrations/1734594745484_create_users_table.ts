import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('profile_picture', 255).nullable()
      table.string('username', 100).nullable()
      table.string('password').notNullable()
      table.string('email', 50).notNullable().unique()
      table.string('bio', 500).nullable()

      table.enum('role', ['CUSTOMER', 'ADMIN']).notNullable().defaultTo('CUSTOMER')
      table.text('my_movie').nullable()
      table.text('my_likes').nullable()
      table.text('my_reviews').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}