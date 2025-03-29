import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
  add,
  getById,
  update,
  remove,
  query,
  getByUsername
}

const COLLECTION_NAME = 'branch'

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  try {
    const collection = await dbService.getCollection(COLLECTION_NAME)
    var users = await collection.find(criteria).toArray()
    users = users.map((user) => {
      delete user.password
      user.createdAt = user._id.getTimestamp()

      return user
    })
    return users
  } catch (err) {
    logger.error('cannot find users', err)
    throw err
  }
}

async function getById(userId) {
  try {
    var criteria = { _id: ObjectId.createFromHexString(userId) }

    const collection = await dbService.getCollection(COLLECTION_NAME)
    const user = await collection.findOne(criteria)
    delete user.password

    criteria = { byUserId: userId }

    user.givenReviews = await reviewService.query(criteria)
    user.givenReviews = user.givenReviews.map((review) => {
      delete review.byUser
      return review
    })

    return user
  } catch (err) {
    logger.error(`while finding user by id: ${userId}`, err)
    throw err
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection(COLLECTION_NAME)
    const user = await collection.findOne({ username })
    return user
  } catch (err) {
    logger.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(userId) }

    const collection = await dbService.getCollection(COLLECTION_NAME)
    await collection.deleteOne(criteria)
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err)
    throw err
  }
}

async function update(user) {
  try {
    const userToSave = {
      _id: new ObjectId(user._id),
      employees: user.employees,
      schedule: user.schedule
    }
    const collection = await dbService.getCollection(COLLECTION_NAME)
    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
    return userToSave
  } catch (err) {
    logger.error(`cannot update user ${user._id}`, err)
    throw err
  }
}

async function add(user) {
  try {
    const userToAdd = {
      username: user.username,
      password: user.password,
      name: user.name,
      isAdmin: user.isAdmin || false
    }
    const collection = await dbService.getCollection(COLLECTION_NAME)
    await collection.insertOne(userToAdd)
    return userToAdd
  } catch (err) {
    logger.error('cannot add user', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    criteria.$or = [
      {
        username: txtCriteria
      },
      {
        fullname: txtCriteria
      }
    ]
  }
  return criteria
}
