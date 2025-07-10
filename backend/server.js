import express from 'express';
import cors from 'cors';
import carRoutes from './routes/cars.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/cars', carRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚗 Backend running on http://localhost:${PORT}`);
});
