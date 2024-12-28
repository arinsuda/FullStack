import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'
import type { InferAuthenticators, InferAuthEvents, Authenticators } from '@adonisjs/auth/types'
import { jwtGuard } from '@maximemrf/adonisjs-jwt/jwt_config'
import { BaseJwtContent, JwtGuardUser } from '@maximemrf/adonisjs-jwt/types'

interface JwtContext extends BaseJwtContent {
  username: string
}

const authConfig = defineConfig({
  default: 'jwt',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: sessionUserProvider({
        model: () => import('#models/user')
      }),
    }),
    jwt: jwtGuard({
      tokenExpiresIn: '1h',
      useCookies: false,
      provider: sessionUserProvider({
        model: () => import('#models/user'),
      }),
      content: <User> (user: JwtGuardUser<User>): JwtContext => ({
        userId: user.getId(),
        username: user.getOriginal().username,
        email: user.getOriginal().email,
        bio: user.getOriginal().bio,
        role: user.getOriginal().role
      })
    })
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}