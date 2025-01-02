import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Review from './ReviewsMovie.js'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'


export default class ReviewLike extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reviewId: number

  @column()
  declare userId: number

  @column()
  declare isLiked: boolean

  @belongsTo(() => Review, { foreignKey: 'reviewId' })
  declare review: BelongsTo<typeof Review>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}