import React, { useState } from 'react';
import FoodSummary from "../components/FoodSummary";
import FoodInventory from "../components/FoodInventory";
import MapPlaceholder from "../components/MapPlaceholder";
import SurvivalProfile from "../components/SurvivalProfile";
import mapboxgl from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = "pk.eyJ1IjoiYWNrYmVycnkiLCJhIjoiY205ZXJwcGFnMThjMTJqcTB2M3dzZzN4cyJ9.pjVKQShF6dLRVccL5lzcTQ"; // or use import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const DashboardPage = () => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [caloricIntake, setCaloricIntake] = useState(null);

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6">
      <div className="w-full max-w-7xl mb-8">
      <h1 className="glitch-effect">Survival Dashboard</h1>
      </div>

      <div className={`w-full max-w-7xl flex flex-col lg:flex-row gap-8 transition-all duration-500`}>
        
        {/* LEFT: Survival Profile */}
        <div className={`w-full lg:w-1/2 transition-transform duration-500 ${hasSubmitted ? 'translate-x-[-5%]' : ''}`}>
          <SurvivalProfile 
            setHasSubmitted={setHasSubmitted}
            setCaloricIntake={setCaloricIntake}
          />
        </div>

        {/* RIGHT: Food Info */}
        {hasSubmitted && (
          <div className="w-full lg:w-1/2 flex flex-col gap-6 fade-in">
            <FoodSummary caloricIntake={caloricIntake} />
            <FoodInventory />
            <MapPlaceholder />
          </div>
        )}
      </div>
    </div>
  );
};


export default DashboardPage;
