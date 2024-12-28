import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Role from '../contact/role.js'
import LikesMovie from './LikesMovie.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Review from './ReviewsMovie.js'
import WatchLists from './Watchlist.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare profile_picture: string

  @column()
  declare bio: string

  @column()
  declare role: Role

  @hasMany(() => WatchLists, { foreignKey: 'userId' })
  declare my_watchlists: HasMany<typeof WatchLists>

  @hasMany(() => LikesMovie, { foreignKey: 'userId' })
  declare my_likes: HasMany<typeof LikesMovie>

  @hasMany(() => Review, { foreignKey: 'userId' })
  declare my_reviews: HasMany<typeof Review>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
