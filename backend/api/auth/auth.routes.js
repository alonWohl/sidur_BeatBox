import express from 'express'

import { login, signup, logout, getLoggedinUser } from './auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.get('/user', getLoggedinUser)

export const authRoutes = router
