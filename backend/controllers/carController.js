import axios from 'axios';
import { load } from 'cheerio';  // <-- Cambiar import

export const scrapFromMercadoLibre = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });

  const searchUrl = `https://autos.mercadolibre.com.ar/${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(searchUrl);
    const $ = load(data);  // <-- Usar load, no cheerio.load
    const cars = [];

    $('.ui-search-result').each((i, el) => {
      const title = $(el).find('.ui-search-item__title').text().trim();
      const priceText = $(el).find('.price-tag-fraction').first().text().replace(/\./g, '');
      const price = parseInt(priceText) || 0;
      const location = $(el).find('.ui-search-item__location').text().trim();
      const image = $(el).find('img').attr('data-src') || '';
      const link = $(el).find('a.ui-search-link').attr('href');

      cars.push({
        title,
        price,
        priceUSD: Math.round(price / 1000),
        location,
        image,
        link,
        priceScore: 'regular' // luego podés mejorar esto
      });
    });

    res.json(cars.slice(0, 10));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al scrapear' });
  }
};
