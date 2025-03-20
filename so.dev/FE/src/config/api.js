// API configuration for both development and production environments
const API_URL = import.meta.env.PROD 
  ? 'https://so-dev-backend.onrender.com' // Replace with your actual backend URL on render.com
  : 'http://localhost:5001';

export default API_URL;
