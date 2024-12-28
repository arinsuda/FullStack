import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'  // นำเข้า uuid
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

export default class Like extends BaseModel {
  public static table = 'likes_movies'
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: number

  @column()
  declare movieId: number

  @column.dateTime({ autoCreate: true })
  declare likedAt: DateTime 

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  
  @beforeCreate()
  public static assignUuid(likeMovie: Like) {
    likeMovie.id = uuidv4()
  }
}
