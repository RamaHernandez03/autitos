// src/config.js
const PROD_DEFAULT = 'https://autitos-production.up.railway.app';

const config = {
  API_BASE_URL:
    (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim()) ||
    (process.env.NODE_ENV === 'production' ? PROD_DEFAULT : 'http://localhost:8000'),
};

export default config;
