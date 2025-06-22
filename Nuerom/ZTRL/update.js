import axios from 'axios';

export function update({ userId, newSKEL }, callback) {
  const token = localStorage.getItem('token');
  if (!token) {
    callback(new Error('No authentication token found'), null);
    return;
  }
  console.log('Updating skeleton:', { userId, newSKEL }, 'Token:', token);
  axios
    .post('http://localhost:3001/users/update-skel', {
      userId,
      newSKEL
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      callback(null, response.data); // Pass success data
    })
    .catch((err) => {
      console.log('Update error:', err.response?.data);
      callback(err.response?.data?.error || 'Update failed', null); // Pass error
    });
}