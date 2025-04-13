const FoodSummary = ({ caloricIntake, inventoryCalories }) => {
  const calculateDaysOfFood = () => {
    if (caloricIntake <= 0 || inventoryCalories <= 0) return 0;
    return (inventoryCalories / caloricIntake).toFixed(2);
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#8B4513] shadow-lg fade-in-card">
      <h2 className="text-2xl font-bold text-[#FFA500] mb-6">Caloric Summary</h2>
      {caloricIntake ? (
        <div className="space-y-4">
          <p className="text-white text-xl">
            Daily Needs: {Math.round(caloricIntake).toLocaleString()} calories
          </p>
          <p className="text-white text-xl">
            Total Inventory: {Math.round(inventoryCalories).toLocaleString()} calories
          </p>
          <p className="text-white text-xl">
            Days of Food: {calculateDaysOfFood()} days
          </p>
        </div>
      ) : (
        <p className="text-gray-400">Submit your profile to see your needs.</p>
      )}
    </div>
  );
};

export default FoodSummary;