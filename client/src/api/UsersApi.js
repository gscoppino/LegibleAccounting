import { JSONAPIRequest } from './util/Request.js';
import Auth from './Auth.js';

class UsersApi {
    getAll(active) {
		if (!Auth.token) {
            return Promise.reject();
        }

        // determine if searching active users
        var requestURL = '/api/users/';
        if (active === true || active === false) {
            requestURL += '?is_active=' + (active ? 'true' : 'false');
        }

        return fetch(new JSONAPIRequest(requestURL, Auth.token), {
            method: 'GET'
        })
            .then(response => response.ok ? Promise.resolve(response) : Promise.reject(response))
            .then(response => response.json())
            .then((response) => {
                return Promise.resolve(response);
            })
            .catch((response) => {
                // Consider how to handle this?
                return Promise.reject(response);
            });
    }

    getOne(id) {
        if (!Auth.token) {
            return Promise.reject();
        }

        return fetch(new JSONAPIRequest(`/api/users/${id}/`, Auth.token), {
            method: 'GET'
        })
            .then(response => response.ok ? Promise.resolve(response) : Promise.reject(response))
            .then(response => response.json())
            .then((response) => {
                return Promise.resolve(response);
            })
            .catch((response) => {
                // Consider how to handle this?
                return Promise.reject(response);
            });
    }

    search(active, searchString) {
    	if (!Auth.token) {
            return Promise.reject();
        }

		// determine if searching active users
        var requestURL = '/api/users/';
        if (active) {
        	requestURL += '?is_active=true&search=';
        } else {
        	requestURL += '?search=';
        }

        // actually search
        requestURL += searchString;

        return fetch(new JSONAPIRequest(requestURL, Auth.token), {
            method: 'GET'
        })
            .then(response => response.ok ? Promise.resolve(response) : Promise.reject(response))
            .then(response => response.json())
            .then((response) => {
                return Promise.resolve(response);
            })
            .catch((response) => {
                // Consider how to handle this?
                return Promise.reject(response);
            });
    }

    create(data) {
        if (!Auth.token) {
            return Promise.reject();
        }

        return fetch(new JSONAPIRequest('/api/users/', Auth.token), {
            method: 'POST',
            body: JSON.stringify(data)
        })
          .then(response => response.ok ? Promise.resolve(response) : Promise.reject(response))
          .then(response => response = response.json())
          .then((response) => {
            return Promise.resolve(response);
          })
          .catch((response) => {
            return Promise.reject(response);
          });
    }

    update(data) {
        if (!Auth.token) {
            return Promise.reject();
        }

        return fetch(new JSONAPIRequest(`/api/users/${data.id}/`, Auth.token), {
            method: 'PUT',
            body: JSON.stringify(data)
        })
          .then(response => response.ok ? Promise.resolve(response) : Promise.reject(response))
          .then(response => response = response.json())
          .then((response) => {
            return Promise.resolve(response);
          })
          .catch((response) => {
            return Promise.reject(response);
          });
    }
}

export default new UsersApi();
