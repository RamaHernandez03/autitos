import { Search } from 'lucide-react';

const SearchForm = ({ searchQuery, setSearchQuery, priceRange, setPriceRange, handleSearch }) => (
  <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
    <div className="text-center max-w-4xl mx-auto">
      <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
        Comprá tu auto al 
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"> mejor precio</span>
      </h2>
      <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
        Analizamos miles de publicaciones de MercadoLibre para mostrarte si el precio es realmente bueno
      </p>

      {/* Formulario */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 h-6 w-6 text-white/60" />
              <input
                type="text"
                placeholder="¿Qué auto estás buscando? (ej: Gol Trend, Corolla, Etios)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-lg"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Mín USD"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-24 md:w-28 px-3 py-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
              <input
                type="number"
                placeholder="Máx USD"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-24 md:w-28 px-3 py-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-8 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 text-lg shadow-lg"
          >
            Buscar Ofertas
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default SearchForm;
