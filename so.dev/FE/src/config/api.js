// API configuration for both development and production environments
const API_URL = import.meta.env.PROD 
  ? 'https://final-project-be-skm3.onrender.com' // Your backend web service URL on render.com
  : 'http://localhost:5001';

export default API_URL;
