import axios from 'axios';

export function logIn({ username, password }, callback) {
  axios
    .post('http://localhost:3001/auth/login', { username, password })
    .then((response) => {
      callback(null, response.data); // Pass success data (message, token, user)
    })
    .catch((err) => {
      callback(err.response?.data?.error || 'Login failed', null); // Pass error
    });
}