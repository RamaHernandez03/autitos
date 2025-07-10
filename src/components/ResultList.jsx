import ResultCard from './ResultCard';

const ResultList = ({ filteredCars, selectedCar, setSelectedCar, helpers }) => (
  <div className="lg:col-span-2">
    <h3 className="text-2xl font-bold text-gray-900 mb-6">
      Resultados para "{helpers.searchQuery}"
    </h3>
    <div className="space-y-6">
      {filteredCars.map(car => (
        <ResultCard
          key={car.id}
          car={car}
          selected={selectedCar?.id === car.id}
          onSelect={setSelectedCar}
          {...helpers}
        />
      ))}
    </div>
  </div>
);

export default ResultList;