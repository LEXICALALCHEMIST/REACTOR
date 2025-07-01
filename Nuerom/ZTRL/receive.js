import axios from 'axios';

export const fetchMorphOps = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    const response = await axios.get('http://localhost:3001/morph/pending', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const ops = response.data.morphOps || response.data; // Handle { morphOps: [...] } or raw array
    return ops;
  } catch (err) {
    throw err.response?.data?.error || 'Failed to fetch morphOps';
  }
};