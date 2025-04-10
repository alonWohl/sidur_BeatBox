import {httpService} from '../http.service';

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser';

export const userService = {
	login,
	logout,
	getLoggedinUser,
};

async function login(credentials) {
	const user = await httpService.post('auth/login', credentials);
	if (user) {
		// Store token in user object if it exists in the response
		if (user.token) {
			localStorage.setItem('userToken', user.token);
		}
		return _saveLocalUser(user);
	}
	return user;
}

async function logout() {
	localStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER);
	return await httpService.post('auth/logout');
}

function getLoggedinUser() {
	return JSON.parse(localStorage.getItem(STORAGE_KEY_LOGGEDIN_USER));
}

function _saveLocalUser(user) {
	user = {
		_id: user._id,
		username: user.username,
		name: user.name,
		isAdmin: user.isAdmin,
		token: user.token || localStorage.getItem('userToken'), // Ensure token is saved
	};
	localStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user));
	return user;
}
