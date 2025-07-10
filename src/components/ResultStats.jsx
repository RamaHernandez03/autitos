import { Search, DollarSign, TrendingUp } from 'lucide-react';

const ResultStats = ({ filteredCars }) => {
  const pricesUSD = filteredCars.map(car => car.priceUSD);
  const avg = (pricesUSD.reduce((a, b) => a + b, 0) / pricesUSD.length) || 0;
  const min = Math.min(...pricesUSD);
  const max = Math.max(...pricesUSD);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Resultados</p>
            <p className="text-3xl font-bold text-gray-900">{filteredCars.length}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
            <p className="text-3xl font-bold text-gray-900">${avg.toFixed(1)}K</p>
          </div>
          <div className="bg-green-100 p-3 rounded-xl">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Precio Mínimo</p>
            <p className="text-3xl font-bold text-gray-900">${min.toFixed(1)}K</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Precio Máximo</p>
            <p className="text-3xl font-bold text-gray-900">${max.toFixed(1)}K</p>
          </div>
          <div className="bg-red-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultStats;