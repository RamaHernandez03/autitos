import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import fondo from './assets/mustang.jpeg';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchForm from './components/SearchForm';
import ResultStats from './components/ResultStats';
import ResultList from './components/ResultList';
import PriceHistoryPanel from './components/PriceHistoryPanel';
import DollarRateDisplay from './components/DollarRateDisplay';

const AutoValor = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dollarRate, setDollarRate] = useState(null);
  const [dollarLoading, setDollarLoading] = useState(false);
  const [dollarError, setDollarError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const autosPorPagina = 20;
  const [priceScoreFilter, setPriceScoreFilter] = useState('');


  const priceHistory = [
    { month: 'Jul 2024', price: 7800 },
    { month: 'Ago 2024', price: 8200 },
    { month: 'Sep 2024', price: 8500 },
    { month: 'Oct 2024', price: 8900 },
    { month: 'Nov 2024', price: 9200 },
    { month: 'Dec 2024', price: 9600 },
    { month: 'Ene 2025', price: 10200 }
  ];

  useEffect(() => {
    const fetchDollarRate = async () => {
      setDollarLoading(true);
      setDollarError(null);
      try {
        const response = await axios.get('http://localhost:8000/api/dollar-rate');
        if (response.data && response.data.dollar_rate) {
          setDollarRate(response.data.dollar_rate);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (err) {
        console.error('Error al obtener cotización del dólar:', err);
        setDollarError('Error al cargar cotización');
      } finally {
        setDollarLoading(false);
      }
    };
    fetchDollarRate();
  }, []);

  const getPriceScoreColor = (score) => ({
    'muy-bueno': 'bg-green-500',
    'bueno': 'bg-green-400',
    'regular': 'bg-yellow-400',
    'malo': 'bg-orange-500',
    'muy-malo': 'bg-red-500'
  }[score] || 'bg-gray-400');

  const getPriceScoreText = (score) => ({
    'muy-bueno': 'Muy Bueno',
    'bueno': 'Bueno',
    'regular': 'Regular',
    'malo': 'Malo',
    'muy-malo': 'Muy Malo'
  }[score] || 'Regular');

  const getPriceScoreWidth = (score) => ({
    'muy-bueno': 'w-1/5',
    'bueno': 'w-2/5',
    'regular': 'w-3/5',
    'malo': 'w-4/5',
    'muy-malo': 'w-full'
  }[score] || 'w-3/5');

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return 'Precio no disponible';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  };

  const formatUSD = (price) => {
    if (price == null || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
  };

  const formatOriginalPrice = (car) => {
    if (!car.originalPrice || car.originalPrice === 0) return 'N/A';
    return car.currency === 'USD' ? formatUSD(car.originalPrice) : formatPrice(car.originalPrice);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
      setLoading(true);
      setError(null);
      setCars([]);
      try {
        const response = await axios.get(`http://localhost:8000/api/cars?query=${encodeURIComponent(searchQuery.trim())}&include_kavak=true&include_ml=true`);
        if (Array.isArray(response.data)) {
          setCars(response.data);
          setPaginaActual(1);
        } else {
          setError('Formato de respuesta inválido');
          setCars([]);
        }
      } catch (err) {
        console.error('Error al buscar autos:', err);
        setError(err.response
          ? `Error del servidor: ${err.response.status} - ${err.response.statusText}`
          : err.request
          ? 'Error de conexión. Verifica que el servidor esté corriendo en http://localhost:8000'
          : 'Error inesperado al buscar autos'
        );
        setCars([]);
      } finally {
        setLoading(false);
        setTimeout(() => {
          const section = document.getElementById('results-section');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const filteredCars = cars.filter((car) => {
    if (!car || car.priceUSD == null) return false;
  
    const carPrice = parseInt(car.priceUSD);
    const min = priceRange.min ? parseInt(priceRange.min) : 0;
    const max = priceRange.max ? parseInt(priceRange.max) : Infinity;
    const inPriceRange = carPrice >= min && carPrice <= max;
    const matchesPriceScore = priceScoreFilter ? car.priceScore === priceScoreFilter : true;
  
    return inPriceRange && matchesPriceScore;
  });
  

  const indiceInicio = (paginaActual - 1) * autosPorPagina;
  const autosPaginados = filteredCars.slice(indiceInicio, indiceInicio + autosPorPagina);
  const totalPaginas = Math.ceil(filteredCars.length / autosPorPagina);

  const irPagina = (num) => {
    if (num >= 1 && num <= totalPaginas) setPaginaActual(num);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero background={fondo}>
        <Header />
        {dollarRate && (
          <div className="text-center mb-4">
            <p className="text-white text-sm bg-black bg-opacity-20 rounded-lg px-4 py-2 inline-block">
              💱 Dólar Blue: ${dollarRate.toFixed(2)} ARS
            </p>
          </div>
        )}
        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          handleSearch={handleSearch}
          priceScoreFilter={priceScoreFilter}
          setPriceScoreFilter={setPriceScoreFilter}
        />

      </Hero>

      {hasSearched && (
        <div id="results-section" className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 mb-8">
              <ResultStats filteredCars={filteredCars} loading={loading} error={error} />
            </div>

            {loading && (
              <div className="lg:col-span-3 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Buscando autos...</p>
                <p className="text-sm text-gray-500 mt-2">Detectando monedas y convirtiendo precios...</p>
              </div>
            )}

            {error && !loading && (
              <div className="lg:col-span-3 text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Resultados (2 columnas) */}
                <div className="lg:col-span-2">
                  <ResultList
                    filteredCars={autosPaginados}
                    selectedCar={selectedCar}
                    setSelectedCar={setSelectedCar}
                    helpers={{
                      searchQuery,
                      formatPrice,
                      formatUSD,
                      formatOriginalPrice,
                      getPriceScoreText,
                      getPriceScoreColor,
                      getPriceScoreWidth
                    }}
                  />

                  {/* Paginador */}
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => irPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                    >
                      ← Anterior
                    </button>
                    {[...Array(totalPaginas)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => irPagina(pageNum)}
                          className={`px-3 py-1 rounded ${
                            pageNum === paginaActual
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => irPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>

                {/* Panel derecho */}
                <div className="space-y-6 lg:sticky lg:top-20 h-fit">
                <PriceHistoryPanel data={priceHistory} />
                <DollarRateDisplay 
                  dollarRate={dollarRate} 
                  loading={dollarLoading} 
                  error={dollarError} 
                />
                </div>

              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoValor;