import axios from 'axios';

export async function getSkel(userId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    const response = await axios.get(`http://localhost:3001/users/${userId}/skel`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.current_skel; // Assume API returns { current_skel: number }
  } catch (error) {
    console.error('getSkel error:', error.message);
    throw error;
  }
}