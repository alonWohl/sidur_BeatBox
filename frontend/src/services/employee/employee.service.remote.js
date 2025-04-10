import {httpService} from '../http.service';

export const employeeService = {
	query,
	getById,
	save,
	remove,
};

async function query(filterBy = {name: '', branch: '', sortField: '', sortDir: ''}) {
	return httpService.get(`employee`, filterBy);
}

function getById(employeeId) {
	return httpService.get(`employee/${employeeId}`);
}

async function remove(employeeId) {
	console.log(`Attempting to remove employee with ID: ${employeeId}`);
	try {
		const result = await httpService.delete(`employee/${employeeId}`);
		console.log('Delete result:', result);
		return result;
	} catch (error) {
		console.error('Error deleting employee:', error.message);
		throw error;
	}
}

async function save(employee) {
	var savedEmployee;
	if (employee.id) {
		savedEmployee = await httpService.put(`employee/${employee.id}`, employee);
	} else {
		savedEmployee = await httpService.post('employee', employee);
	}
	return savedEmployee;
}
