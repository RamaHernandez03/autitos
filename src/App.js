import React, { useState } from 'react';
import './index.css';
import fondo from './assets/mustang.jpeg';

// Componentes
import Header from './components/Header';
import Hero from './components/Hero';
import SearchForm from './components/SearchForm';
import ResultStats from './components/ResultStats';
import ResultList from './components/ResultList';
import PriceHistoryPanel from './components/PriceHistoryPanel';

const AutoValor = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [hasSearched, setHasSearched] = useState(false);

  // Mock autos
  const mockCars = [
    {
      id: 1,
      title: 'Volkswagen Gol Trend 1.6',
      price: 8500000,
      priceUSD: 8500,
      year: 2018,
      km: 85000,
      location: 'Capital Federal',
      image: '/api/placeholder/300/200',
      priceScore: 'muy-bueno',
      publishDate: '2025-01-15'
    },
    {
      id: 2,
      title: 'Volkswagen Gol Trend 1.6 Comfortline',
      price: 9200000,
      priceUSD: 9200,
      year: 2019,
      km: 65000,
      location: 'San Isidro, Buenos Aires',
      image: '/api/placeholder/300/200',
      priceScore: 'bueno',
      publishDate: '2025-01-14'
    },
    {
      id: 3,
      title: 'Volkswagen Gol Trend 1.6 MSI',
      price: 11500000,
      priceUSD: 11500,
      year: 2020,
      km: 45000,
      location: 'La Plata, Buenos Aires',
      image: '/api/placeholder/300/200',
      priceScore: 'regular',
      publishDate: '2025-01-13'
    },
    {
      id: 4,
      title: 'Volkswagen Gol Trend 1.6 Highline',
      price: 13800000,
      priceUSD: 13800,
      year: 2021,
      km: 28000,
      location: 'Quilmes, Buenos Aires',
      image: '/api/placeholder/300/200',
      priceScore: 'malo',
      publishDate: '2025-01-12'
    },
    {
      id: 5,
      title: 'Volkswagen Gol Trend 1.6 Trendline',
      price: 15200000,
      priceUSD: 15200,
      year: 2022,
      km: 15000,
      location: 'Vicente López, Buenos Aires',
      image: '/api/placeholder/300/200',
      priceScore: 'muy-malo',
      publishDate: '2025-01-11'
    }
  ];
  

  // Historial de precios
  const priceHistory = [
    { month: 'Jul 2024', price: 7800 },
    { month: 'Ago 2024', price: 8200 },
    { month: 'Sep 2024', price: 8500 },
    { month: 'Oct 2024', price: 8900 },
    { month: 'Nov 2024', price: 9200 },
    { month: 'Dec 2024', price: 9600 },
    { month: 'Ene 2025', price: 10200 }
  ];

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

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);

  const formatUSD = (price) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
      setTimeout(() => {
        const section = document.getElementById('results-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const filteredCars = mockCars.filter((car) => {
    const matchesSearch = car.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMin = !priceRange.min || car.priceUSD >= parseInt(priceRange.min);
    const matchesMax = !priceRange.max || car.priceUSD <= parseInt(priceRange.max);
    return matchesSearch && matchesMin && matchesMax;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero background={fondo}>
        <Header />
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
              <ResultStats filteredCars={filteredCars} />
            </div>
            <ResultList
              filteredCars={filteredCars}
              selectedCar={selectedCar}
              setSelectedCar={setSelectedCar}
              helpers={{
                searchQuery,
                formatPrice,
                formatUSD,
                getPriceScoreText,
                getPriceScoreColor,
                getPriceScoreWidth
              }}
            />
            <PriceHistoryPanel data={priceHistory} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoValor;
