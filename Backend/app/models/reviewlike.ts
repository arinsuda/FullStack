import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Review from './ReviewsMovie.js'
import User from './user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'


export default class ReviewLike extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reviewId: number

  @column()
  declare userId: number

  @belongsTo(() => Review, { foreignKey: 'reviewId' })
  declare review: BelongsTo<typeof Review>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => Review)
  declare reviews: HasMany<typeof Review>

  @hasMany(() => User)
  declare users: HasMany<typeof User>
}