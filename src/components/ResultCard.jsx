import React from 'react';

const ResultCard = ({ 
  car, 
  selected, 
  onSelect, 
  formatPrice, 
  formatUSD, 
  formatOriginalPrice,
  getPriceScoreText, 
  getPriceScoreColor, 
  getPriceScoreWidth 
}) => {
  // Calcular el precio por transferencia (4% del valor en pesos)
  const calculateTransferPrice = (priceInPesos) => {
    if (!priceInPesos || priceInPesos === 0) return 0;
    return Math.round(priceInPesos * 0.04); // 4% del precio
  };

  // Formatear el precio de transferencia
  const formatTransferPrice = (transferPrice) => {
    if (transferPrice === 0) return 'N/A';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(transferPrice);
  };

  // Formatear kilómetros con separadores de miles
  const formatKilometers = (km) => {
    if (!km || km === 0) return null;
    return new Intl.NumberFormat('es-AR').format(km) + ' km';
  };

  // Determinar el color del badge de kilómetros basado en el valor
  const getKmBadgeColor = (km, year) => {
    if (!km || !year) return 'bg-gray-100 text-gray-800';
    
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - year;
    const avgKmPerYear = km / carAge;
    
    if (avgKmPerYear < 10000) return 'bg-green-100 text-green-800'; // Bajo kilometraje
    if (avgKmPerYear < 20000) return 'bg-yellow-100 text-yellow-800'; // Kilometraje normal
    return 'bg-red-100 text-red-800'; // Alto kilometraje
  };

  // Función para manejar el clic en "Ver Publicación"
  const handleViewListing = (e) => {
    e.stopPropagation(); // Evitar que se active el onSelect del card
    if (car.url) {
      window.open(car.url, '_blank', 'noopener,noreferrer');
    } else {
      console.error('URL no disponible para este auto');
    }
  };

  const transferPrice = calculateTransferPrice(car.price);
  const formattedKm = formatKilometers(car.km);
  const sourceName = car.url?.includes('kavak.com') ? 'Kavak' : 'MercadoLibre';



  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => onSelect(car)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Imagen */}
        <div className="md:w-1/3 relative">
          <img
            src={car.image}
            alt={car.title}
            className="w-full h-48 md:h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-car.png';
            }}
          />
          {/* Badge de moneda original */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              car.currency === 'USD' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {car.currency === 'USD' ? 'USD' : 'ARS'}
            </span>
          </div>
          {/* Badge de kilómetros */}
          {formattedKm && (
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getKmBadgeColor(car.km, car.year)}`}>
                {formattedKm}
              </span>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
              {car.title}
            </h3>
            <div className="ml-4 text-right">
              {/* Precio original */}
              <div className="text-sm text-gray-500 mb-1">
                Precio original: {formatOriginalPrice ? formatOriginalPrice(car) : 'N/A'}
              </div>
              {/* Precios convertidos */}
              <div className="text-xl font-bold text-gray-900">
                {formatUSD(car.priceUSD)}
              </div>
              <div className="text-sm text-gray-600">
                {formatPrice(car.price)}
              </div>
            </div>
          </div>

          {/* Score de precio */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Evaluación de precio:
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getPriceScoreColor(car.priceScore)}`}>
                {getPriceScoreText(car.priceScore)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getPriceScoreColor(car.priceScore)} ${getPriceScoreWidth(car.priceScore)}`}
              ></div>
            </div>
          </div>

          {/* Información adicional en grid responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
            {(car.year || car.km) && (
              <div className="flex items-center gap-4">
                {car.year && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700">🗓️ Año:</span>
                    <span className="ml-2">{car.year}</span>
                  </div>
                )}
                {car.km && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700">🚗</span>
                    <span className="ml-1">{formattedKm}</span>
                  </div>
                )}
              </div>
            )}
            {car.location && (
              <div className="flex items-center sm:col-span-2">
                <span className="font-medium text-gray-700">📍 Ubicación:</span>
                <span className="ml-2">{car.location}</span>
              </div>
            )}
          </div>

          {/* Botón Ver Publicación */}
          <div className="mb-4">
            <button
              onClick={handleViewListing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                />
              </svg>
              Ver Publicación en {sourceName}
            </button>
          </div>

          {/* Indicador de conversión */}
          {car.currency === 'USD' && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700">
                💱 Precio convertido desde USD usando cotización del dólar blue
              </p>
            </div>
          )}
          {car.currency === 'ARS' && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                🇦🇷 Precio original en pesos argentinos
              </p>
            </div>
          )}

          {/* Precio por transferencia - Disclaimer */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 italic">
              ⚠️ Atención: Costo de transferencia aproximado {formatTransferPrice(transferPrice)} (4% Aprox.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;