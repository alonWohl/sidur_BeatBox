// auth.service.js
import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'
import { userService } from '../branch/user.service.js'
import { logger } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')
const SALT_ROUNDS = 10

export const authService = {
  signup,
  login,
  getLoginToken,
  validateToken
}

async function login(username, password) {
  logger.debug(`auth.service - login with username: ${username}`)

  const user = await userService.getByUsername(username)
  if (!user) return Promise.reject('Invalid username or password')

  const match = await bcrypt.compare(password, user.password)
  if (!match) return Promise.reject('Invalid username or password')

  // Add last login timestamp
  await userService.update({ ...user, lastLogin: Date.now() })

  delete user.password
  user._id = user._id.toString()
  return user
}

async function signup({ username, password, name, isAdmin }) {
  logger.debug(`auth.service - signup with username: ${username}`)
  if (!username || !password) return Promise.reject('Missing required signup information')

  const userExist = await userService.getByUsername(username)
  if (userExist) return Promise.reject('Username already taken')

  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  return userService.add({
    username,
    password: hash,
    name,
    isAdmin,
    createdAt: Date.now()
  })
}

function getLoginToken(user) {
  const userInfo = {
    _id: user._id,
    name: user.name,
    username: user.username,
    isAdmin: user.isAdmin,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
  }
  return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
  try {
    const json = cryptr.decrypt(loginToken)
    const loggedinUser = JSON.parse(json)

    // Check if token has expired
    if (loggedinUser.exp && loggedinUser.exp < Date.now()) {
      logger.info(`Token expired for user: ${loggedinUser.username}`)
      return null
    }

    return loggedinUser
  } catch (err) {
    logger.error('Invalid login token', err)
  }
  return null
}
