import React, { useState } from 'react';
import FoodSummary from "../components/FoodSummary";
import FoodInventory from "../components/FoodInventory";
import MapPlaceholder from "../components/MapPlaceholder";
import SurvivalProfile from "../components/SurvivalProfile";

const DashboardPage = () => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [caloricIntake, setCaloricIntake] = useState(null);
  const [inventoryCalories, setInventoryCalories] = useState(0);
  const [foragingRecommendations, setForagingRecommendations] = useState('');
  const [location, setLocation] = useState('');

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6">
      <div className="w-full max-w-7xl mb-8">
        <h1 className="text-4xl font-bold text-[#FFA500] mb-8 text-center static-noise">
          Survival Dashboard
        </h1>     
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 transition-all duration-500">
        
        {/* LEFT: Survival Profile */}
        <div className={`w-full ${hasSubmitted ? 'lg:w-1/2' : 'w-full'} flex transition-transform duration-500 ${
          hasSubmitted ? 'justify-start translate-x-[-5%]' : 'justify-center'
        } sticky top-24 h-fit`}>
          <SurvivalProfile 
            setHasSubmitted={setHasSubmitted}
            setCaloricIntake={setCaloricIntake}
            setForagingRecommendations={setForagingRecommendations}
            setLocation={setLocation}
          />
        </div>

        {/* RIGHT: Food Info */}
        {hasSubmitted && (
          <div className="w-full lg:w-2/3 flex flex-col items-center gap-6 fade-in">
            <div className="w-full max-w-xl">
              <FoodSummary 
                caloricIntake={caloricIntake} 
                inventoryCalories={inventoryCalories}
              />
            </div>
            
            <div className="w-full max-w-xl">
              <FoodInventory onCaloriesChange={setInventoryCalories} />
            </div>
            <div className="w-full max-w-xl">
              <MapPlaceholder location={location} />
            </div>
            {foragingRecommendations && (
              <div className="w-full max-w-xl p-6 bg-[#1a1a1a] rounded-lg border border-[#8B4513] fade-in-card">
                <h2 className="text-2xl font-bold text-[#FFA500] mb-6">Survival Food Recommendations</h2>
                <p className="text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: foragingRecommendations }} />
              </div>
            )} 
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;



