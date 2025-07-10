import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PriceHistoryPanel = ({ data }) => (
  <div className="lg:col-span-1">
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Historial de Precios</h3>
      <p className="text-sm text-gray-600 mb-6">Volkswagen Gol Trend 1.6 - Últimos 7 meses</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip 
              formatter={(value) => [`${value.toLocaleString()}`, 'Precio USD']}
              labelFormatter={(label) => `Mes: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-semibold text-blue-900 mb-2">Tendencia del Mercado</h4>
        <p className="text-sm text-blue-800">
          El precio promedio del Gol Trend ha aumentado un <strong>30.8%</strong> en los últimos 7 meses.
        </p>
        <p className="text-sm text-blue-800 mt-2">
          Proyección: continúa al alza debido a la demanda sostenida.
        </p>
      </div>
    </div>
  </div>
);

export default PriceHistoryPanel;
