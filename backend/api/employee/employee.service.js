import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { isColorTooLight, makeId } from '../../services/util.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const employeeService = {
  query,
  getById,
  add,
  update,
  remove
}

async function query(filterBy = { username: '' }) {
  const collection = await dbService.getCollection('branch')
  try {
    const filter = {
      username: filterBy.username
    }
    const branch = await collection.findOne(filter)
    return branch.employees
  } catch (err) {
    logger.error('Cannot find employees', err)
    throw err
  }
}

async function getById(employeeId) {
  try {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const collection = await dbService.getCollection('branch')
    const criteria = {
      username: loggedinUser.username,
      'employees.id': employeeId
    }
    const branch = await collection.findOne(criteria)
    if (!branch) throw new Error('Branch not found')
    return branch.employees.find((employee) => employee.id === employeeId)
  } catch (err) {
    logger.error('Cannot find employee', err)
    throw err
  }
}

async function add(employee) {
  const { loggedinUser } = asyncLocalStorage.getStore()

  try {
    const employeeToAdd = {
      id: makeId(),
      name: employee.name,
      color: employee.color,
      branch: employee.branch
    }

    const collection = await dbService.getCollection('branch')
    const criteria = _buildCriteria(loggedinUser, employeeToAdd)

    const branch = await collection.findOne(criteria)

    if (!branch) throw new Error('Branch not found')

    await validateEmployee(collection, loggedinUser, employeeToAdd)

    const addedEmployee = await collection.updateOne(criteria, { $push: { employees: employeeToAdd } })

    if (addedEmployee.matchedCount === 0) {
      throw new Error('Branch not found')
    }

    return employeeToAdd
  } catch (err) {
    logger.error('Cannot add employee', err)
    throw err
  }
}

async function update(employee) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  const collection = await dbService.getCollection('branch')

  try {
    const employeeToUpdate = {
      id: employee.id,
      name: employee.name,
      color: employee.color,
      branch: employee.branch
    }

    await validateEmployee(collection, loggedinUser, employeeToUpdate, true)

    const updatedEmployee = await collection.updateOne(
      { username: loggedinUser.username, 'employees.id': employeeToUpdate.id },
      { $set: { 'employees.$.name': employeeToUpdate.name, 'employees.$.color': employeeToUpdate.color } }
    )
    return employeeToUpdate
  } catch (err) {
    logger.error('Cannot update employee', err)
    throw err
  }
}

async function remove(employeeId) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  try {
    const collection = await dbService.getCollection('branch')
    await collection.updateOne({ username: loggedinUser.username }, { $pull: { employees: { id: employeeId } } })
  } catch (err) {
    logger.error('Cannot remove employee', err)
    throw err
  }
}

async function validateEmployee(collection, loggedinUser, employee, isUpdate = false) {
  if (employee.name.length < 2) {
    throw new Error('שם העובד חייב להכיל לפחות 2 תווים')
  }

  const nameExists = await isNameExists(collection, loggedinUser.username, employee.name, isUpdate ? employee.id : null)
  if (nameExists) {
    throw new Error('שם העובד כבר קיים')
  }

  const colorExists = await isColorExists(collection, loggedinUser.username, employee.color, isUpdate ? employee.id : null)
  if (colorExists) {
    throw new Error('צבע זה כבר קיים במערכת')
  }

  if (!employee.color) {
    throw new Error('אנא בחר צבע')
  }

  if (isColorTooLight(employee.color)) {
    throw new Error('הצבע בהיר מדי')
  }
}

async function isColorExists(collection, username, color, excludeEmployeeId = null) {
  const branch = await collection.findOne({ username })
  if (!branch || !branch.employees) return false

  return branch.employees.some((emp) => emp.color === color && (!excludeEmployeeId || emp.id !== excludeEmployeeId))
}

async function isNameExists(collection, username, name, excludeEmployeeId = null) {
  const branch = await collection.findOne({ username })
  if (!branch || !branch.employees) return false

  return branch.employees.some((emp) => emp.name === name && (!excludeEmployeeId || emp.id !== excludeEmployeeId))
}

function _buildCriteria(loggedinUser, employeeToAdd) {
  if (loggedinUser.isAdmin) {
    return {
      name: employeeToAdd.branch
    }
  } else {
    return {
      username: loggedinUser.username
    }
  }
}
