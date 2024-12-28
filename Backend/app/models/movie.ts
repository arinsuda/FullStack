import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'

export default class Movie extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare movieId: number

  @column()
  declare members: number

  @column()
  declare rating: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(movie: Movie) {
    movie.id = uuidv4()
  }
}