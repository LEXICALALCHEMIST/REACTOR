import axios from 'axios';

export function create(morphOp, callback) {
  const token = localStorage.getItem('token');
  if (!token) {
    callback(new Error('No authentication token found'), null);
    return;
  }
  console.log('Sending morphOp:', morphOp, 'Token:', token);
  axios
    .post('http://localhost:3001/morph/create', {
      intent: morphOp.intent,
      value: morphOp.value,
      targetMorphId: morphOp.targetMorphId,
      signature: morphOp.signature // Ensured to include signature
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      callback(null, response.data); // Pass success data (message, morphOp)
    })
    .catch((err) => {
      console.log('Error response:', err.response?.data);
      callback(err.response?.data?.error || 'Send failed', null); // Pass error
    });
}