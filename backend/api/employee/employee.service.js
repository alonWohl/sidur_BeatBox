import {ObjectId} from 'mongodb';
import {dbService} from '../../services/db.service.js';
import {logger} from '../../services/logger.service.js';
import {isColorTooLight, makeId} from '../../services/util.service.js';
import {asyncLocalStorage} from '../../services/als.service.js';

export const employeeService = {
	query,
	getById,
	add,
	update,
	remove,
};

async function query(filterBy = {name: ''}) {
	const collection = await dbService.getCollection('branch');
	try {
		const criteria = {
			name: filterBy.name,
		};

		const branch = await collection.findOne(criteria);
		return branch.employees;
	} catch (err) {
		logger.error('Cannot find employees', err);
		throw err;
	}
}

async function getById(employeeId) {
	try {
		const {loggedinUser} = asyncLocalStorage.getStore();
		const collection = await dbService.getCollection('branch');
		const criteria = {
			username: loggedinUser.username,
			'employees.id': employeeId,
		};
		const branch = await collection.findOne(criteria);
		if (!branch) throw new Error('Branch not found');
		return branch.employees.find((employee) => employee.id === employeeId);
	} catch (err) {
		logger.error('Cannot find employee', err);
		throw err;
	}
}

async function add(employee) {
	const {loggedinUser} = asyncLocalStorage.getStore();

	try {
		const isMoked = employee.branch === 'מוקד';

		const employeeToAdd = {
			id: makeId(),
			name: employee.name,
			branch: employee.branch,
			departments: isMoked ? [] : employee.departments || ['waiters'], // No default departments for Moked
		};
		
		// Only include color for Moked employees
		if (isMoked && employee.color) {
			employeeToAdd.color = employee.color;
		}

		const collection = await dbService.getCollection('branch');

		const criteria = {
			name: employee.branch || loggedinUser.name,
		};

		const branch = await collection.findOne(criteria);

		if (!branch) throw new Error('Branch not found');

		await validateEmployee(collection, loggedinUser, employeeToAdd);

		const addedEmployee = await collection.updateOne(criteria, {$push: {employees: employeeToAdd}});

		if (addedEmployee.matchedCount === 0) {
			throw new Error('Branch not found');
		}

		return employeeToAdd;
	} catch (err) {
		logger.error('Cannot add employee', err);
		throw err;
	}
}

async function update(employee) {
	const {loggedinUser} = asyncLocalStorage.getStore();
	const collection = await dbService.getCollection('branch');

	try {
		const isMoked = employee.branch === 'מוקד';

		// Get existing employee first to preserve values if not provided
		const existingEmployee = await getById(employee.id);
		
		if (!existingEmployee) {
			throw new Error('העובד לא נמצא');
		}
		
		logger.info(`Existing employee: ${JSON.stringify(existingEmployee)}`);
		logger.info(`Employee to update (input): ${JSON.stringify(employee)}`);
		
		const employeeToUpdate = {
			id: employee.id,
			name: employee.name,
			branch: employee.branch,
		};
		
			// Handle departments - use existing if not provided or empty
		if (isMoked) {
			employeeToUpdate.departments = [];
		} else if (employee.departments !== undefined && Array.isArray(employee.departments) && employee.departments.length > 0) {
			// Use provided departments if they exist and are valid (non-empty)
			employeeToUpdate.departments = employee.departments;
		} else {
			// Use existing departments if provided ones are missing/invalid/empty
			// This ensures we always have valid departments for validation
			if (existingEmployee.departments && Array.isArray(existingEmployee.departments) && existingEmployee.departments.length > 0) {
				employeeToUpdate.departments = existingEmployee.departments;
			} else {
				// Last resort: default (shouldn't happen if employee was created correctly)
				employeeToUpdate.departments = ['waiters'];
			}
		}
		
		// Only include color for Moked employees
		if (isMoked && employee.color) {
			employeeToUpdate.color = employee.color;
		}

		logger.info(`Employee to update (final): ${JSON.stringify(employeeToUpdate)}`);

		await validateEmployee(collection, loggedinUser, employeeToUpdate, true);
		
		// Build update object conditionally
		const updateFields = {
			'employees.$.name': employeeToUpdate.name,
			'employees.$.departments': employeeToUpdate.departments,
		};
		
		// Build update operation
		const updateOperation = { $set: updateFields };
		
		// Only update color for Moked employees
		if (isMoked && employeeToUpdate.color) {
			updateFields['employees.$.color'] = employeeToUpdate.color;
		} else if (!isMoked && existingEmployee && existingEmployee.color) {
			// Remove color for non-Moked branches only if they had a color
			updateOperation.$unset = { 'employees.$.color': '' };
		}
		
		const updatedEmployee = await collection.updateOne(
			{username: loggedinUser.username, 'employees.id': employeeToUpdate.id},
			updateOperation
		);
		return employeeToUpdate;
	} catch (err) {
		logger.error('Cannot update employee', err);
		throw err;
	}
}

async function remove(employeeId) {
	const {loggedinUser} = asyncLocalStorage.getStore();
	try {
		const collection = await dbService.getCollection('branch');

		// Add logging to debug the issue
		logger.info(`Attempting to remove employee with ID: ${employeeId}`);
		logger.info(`User attempting removal: ${JSON.stringify(loggedinUser)}`);

		// Look for branch by name and username for flexibility
		const query = {
			$or: [{name: loggedinUser.name}, {username: loggedinUser.username}],
			'employees.id': employeeId,
		};

		logger.info(`Search query: ${JSON.stringify(query)}`);

		// Get branch before update to verify employee exists
		const branch = await collection.findOne(query);

		if (!branch) {
			logger.error(
				`Branch not found for user ${
					loggedinUser.username || loggedinUser.name
				} or employee ${employeeId} not in branch`
			);
			throw new Error('המשתמש או העובד לא נמצאו');
		}

		// Check if employee exists in branch
		const employeeExists = branch.employees.some((emp) => emp.id === employeeId);
		if (!employeeExists) {
			logger.error(`Employee ${employeeId} not found in branch`);
			throw new Error('העובד לא נמצא בסניף');
		}

		// Perform the removal with the same flexible query
		const result = await collection.updateOne(query, {$pull: {employees: {id: employeeId}}});

		logger.info(`Remove result: ${JSON.stringify(result)}`);

		if (result.modifiedCount === 0) {
			logger.error('No employee was removed');
			throw new Error('לא בוצעה מחיקה');
		}

		return result;
	} catch (err) {
		logger.error('Cannot remove employee', err);
		throw err;
	}
}

async function validateEmployee(collection, loggedinUser, employee, isUpdate = false) {
	if (employee.name.length < 2) {
		throw new Error('שם העובד חייב להכיל לפחות 2 תווים');
	}

	const nameExists = await isNameExists(
		collection,
		loggedinUser.username,
		employee.name,
		isUpdate ? employee.id : null
	);
	if (nameExists) {
		throw new Error('שם העובד כבר קיים');
	}

	// Check for departments only if not a Moked employee
	const isMoked = employee.branch === 'מוקד';
	
	// Color validation - only required for Moked employees
	if (isMoked) {
		const colorExists = await isColorExists(
			collection,
			loggedinUser.username,
			employee.color,
			isUpdate ? employee.id : null
		);
		if (colorExists) {
			throw new Error('צבע זה כבר קיים במערכת');
		}

		if (!employee.color) {
			throw new Error('אנא בחר צבע');
		}

		if (isColorTooLight(employee.color)) {
			throw new Error('הצבע בהיר מדי');
		}
	}
	
	if (!isMoked && (!employee.departments || employee.departments.length === 0)) {
		throw new Error('עובד חייב להיות שייך למחלקה אחת לפחות');
	}
}

async function isColorExists(collection, username, color, excludeEmployeeId = null) {
	// If color is undefined or null, it doesn't exist
	if (!color) return false;
	
	const branch = await collection.findOne({username});
	if (!branch || !branch.employees) return false;

	return branch.employees.some((emp) => emp.color === color && (!excludeEmployeeId || emp.id !== excludeEmployeeId));
}

async function isNameExists(collection, username, name, excludeEmployeeId = null) {
	const branch = await collection.findOne({username});
	if (!branch || !branch.employees) return false;

	return branch.employees.some((emp) => emp.name === name && (!excludeEmployeeId || emp.id !== excludeEmployeeId));
}
