
import axios from 'axios';

export function updateMorph({ morphOpId, status }, callback) {
  const token = localStorage.getItem('token');
  if (!token) {
    callback(new Error('No authentication token found'), null);
    return;
  }
  if (!morphOpId || !['COMPLETED', 'FAILED'].includes(status)) {
    callback(new Error('Invalid morphOpId or status'), null);
    return;
  }
  console.log('Updating morphOp:', { morphOpId, status }, 'Token:', token);
  axios
    .post('http://localhost:3001/morph/update', { morphOpId, status }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      callback(null, response.data); // Pass success data
    })
    .catch((err) => {
      console.error('UpdateMorph error:', err.response?.data);
      callback(err.response?.data?.error || 'UpdateMorph failed', null); // Pass error
    });
}