import axios from 'axios';

// Vite environments can supply VITE_API_URL, fallback to localhost port 5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    console.log('--- AXIOS REQUEST OUTBOUND ---');
    console.log(`Sending to: ${config.baseURL}${config.url}`);
    console.log('Payload headers:', JSON.stringify(config.headers));
    const token = localStorage.getItem('rehabnation_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('--- AXIOS REQUEST EXCEPTION ---', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('--- AXIOS RESPONSE INBOUND ---');
    console.log(`Response status: ${response.status}`);
    console.log('Response body:', JSON.stringify(response.data));
    return response;
  },
  (error) => {
    console.error('--- AXIOS RESPONSE FAILURE ---');
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error('Error details:', JSON.stringify(error.response.data));
    } else {
      console.error('No response received. Message:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
