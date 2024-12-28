import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

export default class WatchLists extends BaseModel {
  public static table = 'watchlists'
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: number

  @column()
  declare movieId: number

  @column()
  declare status: 'TO_WATCH' | 'WATCHED'

  @column()
  declare addedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(watchlist: WatchLists) {
    watchlist.id = uuidv4()
  }
}
