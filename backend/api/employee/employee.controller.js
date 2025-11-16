import {logger} from '../../services/logger.service.js';
import {employeeService} from './employee.service.js';

export async function getEmployees(req, res) {
	const {loggedinUser} = req;
	const filterBy = {
		name: loggedinUser.isAdmin ? (req.query.branch || req.query.name || loggedinUser.name) : loggedinUser.name,
	};
	try {
		const employees = await employeeService.query(filterBy);
		res.json(employees);
	} catch (err) {
		logger.error('Failed to get employees', err);
		res.status(400).send({err: err.message});
	}
}

export async function getEmployee(req, res) {
	const {loggedinUser} = req;
	const {id} = req.params;
	try {
		const employee = await employeeService.getById(id);
		res.json(employee);
	} catch (err) {
		logger.error('Failed to get employee', err);
		res.status(400).send({err: err.message});
	}
}

export async function addEmployee(req, res) {
	const {loggedinUser} = req;
	const isMoked = req.body.branch === 'מוקד';

	const employeeToAdd = {
		name: req.body.name,
		branch: loggedinUser.isAdmin ? req.body.branch || loggedinUser.name : loggedinUser.name,
		departments: isMoked ? [] : req.body.departments || ['waiters'],
	};
	
	// Only include color for Moked employees
	if (isMoked && req.body.color) {
		employeeToAdd.color = req.body.color;
	}

	try {
		const employee = await employeeService.add(employeeToAdd);
		res.json(employee);
	} catch (err) {
		logger.error('Failed to add employee', err);
		res.status(400).send({err: err.message});
	}
}

export async function updateEmployee(req, res) {
	const {loggedinUser} = req;
	const {id} = req.params;
	const isMoked = req.body.branch === 'מוקד';

	logger.info(`Update employee request: id=${id}, isMoked=${isMoked}, body=${JSON.stringify(req.body)}`);

	const employeeToUpdate = {
		id: id,
		name: req.body.name,
		branch: req.body.branch || loggedinUser.name,
	};
	
	// Handle departments - always set it explicitly
	// For non-Moked, if not provided, service will use existing employee's departments
	if (isMoked) {
		employeeToUpdate.departments = [];
	} else if (req.body.departments && Array.isArray(req.body.departments) && req.body.departments.length > 0) {
		employeeToUpdate.departments = req.body.departments;
	}
	// If departments not provided for non-Moked, don't set it - service will use existing
	
	// Only include color for Moked employees
	if (isMoked && req.body.color) {
		employeeToUpdate.color = req.body.color;
	}

	logger.info(`Employee to update: ${JSON.stringify(employeeToUpdate)}`);

	try {
		const employee = await employeeService.update(employeeToUpdate);
		res.json(employee);
	} catch (err) {
		logger.error('Failed to update employee', err);
		logger.error('Error details:', err.message, err.stack);
		res.status(400).send({err: err.message});
	}
}

export async function deleteEmployee(req, res) {
	const {loggedinUser} = req;
	const {id} = req.params;

	try {
		await employeeService.remove(id);
		res.end();
	} catch (err) {
		logger.error('Failed to delete employee', err);
		res.status(400).send({err: err.message});
	}
}
