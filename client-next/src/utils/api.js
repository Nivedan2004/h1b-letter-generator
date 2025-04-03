import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

export const generateLetter = async (data) => {
  try {
    const response = await api.post('/generate-letter', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};