import { Calendar, MapPin, Star } from 'lucide-react';

const ResultCard = ({ car, selected, onSelect, formatPrice, formatUSD, getPriceScoreText, getPriceScoreColor, getPriceScoreWidth }) => (
  <div
    key={car.id}
    className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
      selected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-200'
    }`}
    onClick={() => onSelect(car)}
  >
    <div className="p-6">
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
            Imagen del auto
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-gray-900 mb-2">{car.title}</h4>
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {car.year}
            </span>
            <span>{car.km.toLocaleString()} km</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {car.location}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Valoración del precio</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                car.priceScore === 'muy-bueno' ? 'bg-green-100 text-green-800' :
                car.priceScore === 'bueno' ? 'bg-green-100 text-green-700' :
                car.priceScore === 'regular' ? 'bg-yellow-100 text-yellow-800' :
                car.priceScore === 'malo' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'}`
              }>
                {getPriceScoreText(car.priceScore)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`h-3 rounded-full ${getPriceScoreColor(car.priceScore)} ${getPriceScoreWidth(car.priceScore)}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(car.price)}</p>
              <p className="text-lg text-gray-600">{formatUSD(car.priceUSD)}</p>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">Ver detalles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ResultCard;