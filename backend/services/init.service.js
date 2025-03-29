import { dbService } from './db.service.js'
import { authService } from '../api/auth/auth.service.js'
import { userService } from '../api/branch/user.service.js'
import { logger } from './logger.service.js'

export async function initApp() {
  try {
    const branchCollection = await dbService.getCollection('branch')
    await branchCollection.deleteMany()

    const branches = [
      {
        name: 'מוקד',
        username: 'moked',
        password: '123456',
        isAdmin: true
      },
      {
        name: 'ראש העין',
        username: 'rosh',
        password: '123456'
      },
      {
        name: 'פתח תקווה',
        username: 'pt',
        password: '123456'
      },
      {
        name: 'תל אביב',
        username: 'tlv',
        password: '123456'
      },
      {
        name: 'ראשון לציון',
        username: 'rishon',
        password: '123456'
      }
    ]

    const defaultSchedule = {
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

    for (const branchData of branches) {
      try {
        // Step 1: Create the basic auth user
        const savedBranch = await authService.signup(branchData)
        logger.info(`Created branch auth: ${savedBranch.name}`)

        // Step 2: Update with full branch data
        const branchFullData = {
          _id: savedBranch._id,
          employees: [],
          schedule: defaultSchedule
        }

        await userService.update(branchFullData)
        logger.info(`Updated branch data: ${savedBranch.name}`)
      } catch (error) {
        logger.error(`Failed to initialize branch ${branchData.name}:`, error)

        continue
      }
    }

    logger.info('Database initialization completed successfully')
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    throw error
  }
}

export async function shouldInitialize() {
  try {
    const collection = await dbService.getCollection('branch')
    const count = await collection.countDocuments()
    return count === 0
  } catch (error) {
    logger.error('Failed to check initialization status:', error)
    return false
  }
}

export async function resetDatabase() {
  try {
    const collection = await dbService.getCollection('branch')
    await collection.deleteMany({})
    await initApp()
    logger.info('Database reset completed successfully')
  } catch (error) {
    logger.error('Failed to reset database:', error)
    throw error
  }
}
