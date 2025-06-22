import axios from 'axios';

export function signup({ username, email, password }, callback) {
  axios
    .post('http://localhost:3001/auth/signup', { username, email, password })
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err.response?.data?.error || 'Registration failed', null);
    });
}