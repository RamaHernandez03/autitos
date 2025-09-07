// src/config.js
const config = {
  API_BASE_URL:
    process.env.REACT_APP_API_BASE_URL // ← si la seteás en Vercel, toma esa
    || (process.env.NODE_ENV === 'production'
        ? 'https://autitos-production.up.railway.app' // ← backend
        : 'http://localhost:8000'),
};

export default config;
