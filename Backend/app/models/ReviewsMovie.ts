import { BaseModel, belongsTo, column, hasMany } from "@adonisjs/lucid/orm"
import { DateTime } from "luxon"
import ReviewLike from "./reviewlike.js"
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from "./user.js"

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare movieId: number

  @column()
  declare userId: number

  @column()
  declare rating: number

  @column()
  declare comment: string

  @hasMany(() => ReviewLike, { foreignKey: 'reviewId'})
  declare likes: HasMany<typeof ReviewLike>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
