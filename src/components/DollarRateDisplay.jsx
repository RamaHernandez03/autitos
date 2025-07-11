// components/DollarRateDisplay.js
import React from 'react';

const DollarRateDisplay = ({ dollarRate, loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-gray-600">Cargando cotización...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4 shadow-sm">
        <div className="flex items-center justify-center">
          <span className="text-sm text-red-600">⚠️ Error al obtener cotización</span>
        </div>
      </div>
    );
  }

  if (!dollarRate) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-center">
          <span className="text-sm text-gray-600">💱 Cotización no disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <span className="text-lg">💵</span>
          <span className="text-sm font-medium text-blue-800 ml-2">Dólar Blue Actual</span>
        </div>
        <div className="text-2xl font-bold text-blue-900">
          ${dollarRate.toFixed(2)}
        </div>
        <div className="text-xs text-blue-600 mt-1">
          Promedio de compra y venta
        </div>
      </div>
    </div>
  );
};

export default DollarRateDisplay;