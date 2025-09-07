const config = {
  // Cambiar según el entorno
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://autitos-two.vercel.app' 
    : 'http://localhost:8000'
};

export default config;
