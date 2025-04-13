const FoodSummary = ({ caloricIntake }) => {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#8B4513] shadow-lg">
      <h2 className="text-2xl font-bold text-[#FFA500] mb-6">Caloric Needs</h2>
      {caloricIntake ? (
        <p className="text-white text-xl">
          {Math.round(caloricIntake).toLocaleString()} calories per day
        </p>
      ) : (
        <p className="text-gray-400">Submit your profile to see your needs.</p>
      )}
    </div>
  );
};

export default FoodSummary;