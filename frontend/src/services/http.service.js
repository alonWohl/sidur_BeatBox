import Axios from 'axios';

const BASE_URL = import.meta.env.MODE === 'production' ? '/api/' : '//localhost:3030/api/';

const axios = Axios.create({withCredentials: true});
// console.log('BASE_URL:', BASE_URL)

// Add request interceptor to include authentication token from localStorage
axios.interceptors.request.use(
	(config) => {
		// Get the user token or data from localStorage if exists
		const loggedInUser = localStorage.getItem('loggedinUser');

		if (loggedInUser) {
			try {
				const user = JSON.parse(loggedInUser);
				// Debug logged user
				console.log('Request with user:', user.username);

				// If there's a token, add it to the request headers
				if (user.token) {
					config.headers.Authorization = `Bearer ${user.token}`;
				}
			} catch (error) {
				console.error('Error parsing loggedInUser from localStorage:', error);
			}
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export const httpService = {
	get(endpoint, data) {
		return ajax(endpoint, 'GET', data);
	},
	post(endpoint, data) {
		return ajax(endpoint, 'POST', data);
	},
	put(endpoint, data) {
		return ajax(endpoint, 'PUT', data);
	},
	delete(endpoint, data) {
		return ajax(endpoint, 'DELETE', data);
	},
};

async function ajax(endpoint, method = 'GET', data = null) {
	const url = `${BASE_URL}${endpoint}`;
	const params = method === 'GET' ? data : null;

	const options = {url, method, data, params};

	try {
		console.log(`Making ${method} request to ${url}`, data);
		const res = await axios(options);
		console.log(`Successful ${method} response from ${url}:`, res.data);
		return res.data;
	} catch (err) {
		console.log(`Had Issues ${method}ing to the backend, endpoint: ${endpoint}, with data: `, data);
		console.dir(err);
		if (err.response && err.response.status === 401) {
			localStorage.clear();
			window.location.assign('/');
		}
		throw err;
	}
}
