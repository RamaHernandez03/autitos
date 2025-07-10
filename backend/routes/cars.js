import express from 'express';
import { scrapFromMercadoLibre } from '../controllers/carController.js';

const router = express.Router();

router.get('/', scrapFromMercadoLibre);

export default router;
