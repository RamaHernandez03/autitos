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

  // Historial de precios (este puede seguir siendo estático por ahora)
  const priceHistory = [
    { month: 'Jul 2024', price: 7800 },
    { month: 'Ago 2024', price: 8200 },
    { month: 'Sep 2024', price: 8500 },
    { month: 'Oct 2024', price: 8900 },
    { month: 'Nov 2024', price: 9200 },
    { month: 'Dec 2024', price: 9600 },
    { month: 'Ene 2025', price: 10200 }
  ];

  // Obtener cotización del dólar al cargar el componente
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

  // Funciones auxiliares
  const getPriceScoreColor = (score) => {
    return {
      'muy-bueno': 'bg-green-500',
      'bueno': 'bg-green-400',
      'regular': 'bg-yellow-400',
      'malo': 'bg-orange-500',
      'muy-malo': 'bg-red-500'
    }[score] || 'bg-gray-400';
  };

  const getPriceScoreText = (score) => {
    return {
      'muy-bueno': 'Muy Bueno',
      'bueno': 'Bueno',
      'regular': 'Regular',
      'malo': 'Malo',
      'muy-malo': 'Muy Malo'
    }[score] || 'Regular';
  };

  const getPriceScoreWidth = (score) => {
    return {
      'muy-bueno': 'w-1/5',
      'bueno': 'w-2/5',
      'regular': 'w-3/5',
      'malo': 'w-4/5',
      'muy-malo': 'w-full'
    }[score] || 'w-3/5';
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return 'Precio no disponible';
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatUSD = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatOriginalPrice = (car) => {
    if (!car.originalPrice || car.originalPrice === 0) {
      return 'N/A';
    }
    
    if (car.currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(car.originalPrice);
    } else {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
      }).format(car.originalPrice);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
      setLoading(true);
      setError(null);
      setCars([]); // Limpiar resultados anteriores
      
      try {
        // Hacer la petición al backend
        const response = await axios.get(`http://localhost:8000/api/cars?query=${encodeURIComponent(searchQuery.trim())}`);
        
        // Validar que la respuesta sea un array
        if (Array.isArray(response.data)) {
          setCars(response.data);
        } else {
          setError('Formato de respuesta inválido');
          setCars([]);
        }
      } catch (err) {
        console.error('Error al buscar autos:', err);
        if (err.response) {
          // Error del servidor
          setError(`Error del servidor: ${err.response.status} - ${err.response.statusText}`);
        } else if (err.request) {
          // Error de red
          setError('Error de conexión. Verifica que el servidor esté corriendo en http://localhost:8000');
        } else {
          // Otro error
          setError('Error inesperado al buscar autos');
        }
        setCars([]);
      } finally {
        setLoading(false);
        // Scroll suave a la sección de resultados
        setTimeout(() => {
          const section = document.getElementById('results-section');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  // Filtrar autos por rango de precios (usando USD para consistencia)
  const filteredCars = cars.filter((car) => {
    // Validar que car y car.priceUSD existan
    if (!car || car.priceUSD === null || car.priceUSD === undefined) {
      return false;
    }
    
    const carPrice = parseInt(car.priceUSD);
    const minPrice = priceRange.min ? parseInt(priceRange.min) : 0;
    const maxPrice = priceRange.max ? parseInt(priceRange.max) : Infinity;
    
    return carPrice >= minPrice && carPrice <= maxPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero background={fondo}>
        <Header />
        {/* Mostrar cotización del dólar */}
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
        />
      </Hero>

      {hasSearched && (
        <div id="results-section" className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 mb-8">
              <ResultStats filteredCars={filteredCars} loading={loading} error={error} />
            </div>
            
            {/* Mostrar estado de carga */}
            {loading && (
              <div className="lg:col-span-3 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Buscando autos...</p>
                <p className="text-sm text-gray-500 mt-2">Detectando monedas y convirtiendo precios...</p>
              </div>
            )}

            {/* Mostrar errores */}
            {error && !loading && (
              <div className="lg:col-span-3 text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Mostrar resultados */}
            {!loading && !error && (
              <>
                <ResultList
                  filteredCars={filteredCars}
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
                <div className="space-y-6">
                  <PriceHistoryPanel data={priceHistory} />
                  {/* Componente de cotización del dólar */}
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