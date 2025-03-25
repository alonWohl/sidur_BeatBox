import { dbService } from './db.service.js'
import { authService } from '../api/auth/auth.service.js'
import { scheduleService } from '../api/schedule/schedule.service.js'
import { logger } from './logger.service.js'

export async function initApp() {
  try {
    const existingUsers = await dbService.getCollection('branch')
    const existingSchedules = await dbService.getCollection('schedule')
    existingSchedules.deleteMany()
    existingUsers.deleteMany()

    if (existingUsers.length > 0) {
      logger.info('Database already initialized')
      return
    }

    const users = [
      {
        username: 'moked',
        password: '123456',
        branch: 'מוקד',
        isAdmin: true
      },
      {
        username: 'rosh',
        password: '123456',
        branch: 'ראש העין'
      },
      {
        username: 'pt',
        password: '123456',
        branch: 'פתח תקווה'
      },
      {
        username: 'tlv',
        password: '123456',
        branch: 'תל אביב'
      },
      {
        username: 'rishon',
        password: '123456',
        branch: 'ראשון לציון'
      }
    ]

    if (existingSchedules.length > 0) {
      logger.info('Schedules already initialized')
      return
    }

    for (const userData of users) {
      const savedUser = await authService.signup(userData)
      logger.info(`Created user: ${savedUser.username}`)

      const scheduleData = {
        branch: savedUser.username,
        days: [
          { name: 'ראשון', dayId: 1, shifts: [] },
          { name: 'שני', dayId: 2, shifts: [] },
          { name: 'שלישי', dayId: 3, shifts: [] },
          { name: 'רביעי', dayId: 4, shifts: [] },
          { name: 'חמישי', dayId: 5, shifts: [] },
          { name: 'שישי', dayId: 6, shifts: [] },
          { name: 'שבת', dayId: 7, shifts: [] }
        ]
      }

      await scheduleService.add(scheduleData)
      logger.info(`Created schedule for branch: ${savedUser.username}`)
    }

    logger.info('Database initialization completed successfully')
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    throw error
  }
}
