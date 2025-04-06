// auth.routes.js
import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {
  const { username, password } = req.body
  try {
    const user = await authService.login(username, password)
    const loginToken = authService.getLoginToken(user)

    logger.info('User login: ', user)

    res.cookie('loginToken', loginToken, {
      sameSite: 'None',
      secure: true,
      httpOnly: true, // Prevent JavaScript access to cookie
      maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    })

    res.json(user)
  } catch (err) {
    logger.error('Failed to Login ' + err)
    res.status(401).send({ err: 'Failed to Login' })
  }
}

export async function signup(req, res) {
  try {
    const credentials = req.body
    const account = await authService.signup(credentials)
    logger.debug(`auth.route - new account created: ` + JSON.stringify(account))

    const user = await authService.login(credentials.username, credentials.password)
    logger.info('User signup:', user)

    const loginToken = authService.getLoginToken(user)
    res.cookie('loginToken', loginToken, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    })

    res.json(user)
  } catch (err) {
    logger.error('Failed to signup ' + err)
    res.status(400).send({ err: 'Failed to signup' })
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie('loginToken')
    res.send({ msg: 'Logged out successfully' })
  } catch (err) {
    res.status(400).send({ err: 'Failed to logout' })
  }
}

export async function getLoggedinUser(req, res) {
  try {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not authenticated')

    // Return user data without sensitive fields
    res.json(loggedinUser)
  } catch (err) {
    logger.error('Failed to get logged in user', err)
    res.status(401).send({ err: 'Failed to authenticate' })
  }
}
