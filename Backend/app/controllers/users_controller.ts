import User from '#models/user'
import { registerUserValiator } from '#validators/users'
import type { HttpContext } from '@adonisjs/core/http'
import Role from '../contact/role.js'
import { LoginValiator } from '#validators/login'
import { UserInformation } from '#validators/userInfo'

export default class UsersController {
  async show({ params, response }: HttpContext) {
    try {
      const userId = params.id
      const user = await User.query()
        .where('id', userId)
        .preload('my_watchlists') 
        .preload('my_likes')      
        .firstOrFail()            

      return response.json({
        message: 'User fetched successfully',
        data: user,
      })

    } catch (error) {
      return response.status(404).json({
        message: 'User not found',
        error: error.message,
      })
    }
  }

  async login({ auth, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(LoginValiator)
      const { username, password } = payload
      const user = await User.verifyCredentials(username, password)

      if (user) {
        console.log(user)
        const token = await auth.use('jwt').generate(user)
        return response.status(201).json({
          message: 'Login successful',
          data: { token },
        })
      }
    } catch (error) {
      return response.badRequest(error)
    }
  }

  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerUserValiator)
      const role = payload.role || Role.CUSTOMER

      const user = await User.create({
        username: payload.username,
        email: payload.email,
        password: payload.password,
        role: role,
      })

      return response.status(201).json({
        message: `The user ${user.username} has been registered successfully.`,
        data: { username: user.username, email: user.email },
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to register user.',
        errors: error.messages || error.toString(),
      })
    }
  }

  async edit({ auth, params, request, response }: HttpContext) {
    try {
      const userId = params.id

      const currentUser = auth.user
      if (!currentUser || currentUser.id !== Number(userId)) {
        return response.status(403).json({
          message: 'You are not authorized to update this user.',
        })
      }

      const user = await User.findOrFail(userId)
      const payload = await request.validateUsing(UserInformation)
  
      user.merge(payload)
      await user.save()
  
      return response.json({
        message: `User ${user.username} has been updated successfully.`,
        data: user,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Failed to update user.',
        error: error || 'An error occurred while updating the user.',
      })
    }
  }

  async showProfile({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        throw new Error('Unauthorized')
      }

      return response.ok({ user })
    } catch (error) {
      return response.status(401).json({
        message: 'Unauthorized access',
        error: error.message,
      })
    }
  }
}
