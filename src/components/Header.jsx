import { TrendingUp } from 'lucide-react';

const Header = () => (
  <div className="absolute top-0 left-0 right-0 z-10">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-white">Autitos.com</h1>
        </div>
        <div className="text-white/80 text-sm hidden md:block">
          Encontrá el mejor precio para tu próximo auto
        </div>
      </div>
    </div>
  </div>
);

export default Header;
