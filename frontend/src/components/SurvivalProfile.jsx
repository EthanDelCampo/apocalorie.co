import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Cookies from 'js-cookie';
import FoodInventory from './FoodInventory';
import DevToggle from './DevToggle';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const SurvivalProfile = ({ setHasSubmitted, setCaloricIntake, setForagingRecommendations }) => {
  const [formData, setFormData] = useState({
    heightFeet: '',
    heightInches: '',
    weight: '',
    sex: '',
    activityLevel: '',
    location: '',
    age: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const [hasSubmitted, setLocalHasSubmitted] = useState(false);
  const [caloricIntake, setLocalCaloricIntake] = useState(null);
  const [inventoryCalories, setInventoryCalories] = useState(0);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(true);
  const [foragingRecommendations, setLocalForagingRecommendations] = useState(null);

  const calculateDaysOfFood = () => {
    if (caloricIntake <= 0 || inventoryCalories <= 0) return 0;
    return Math.floor(inventoryCalories / caloricIntake);
  };

  useEffect(() => {
    const savedData = Cookies.get('survivalProfile');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        if (parsedData.caloricIntake) {
          setCaloricIntake(parsedData.caloricIntake);
        }
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });

    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${mapboxgl.accessToken}&types=place,address&limit=5`
        );
        const data = await response.json();
        setSuggestions(data.features.map(feature => feature.place_name));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, location: suggestion });
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const totalHeightInches = (parseInt(formData.heightFeet) * 12) + parseInt(formData.heightInches);

    const dataToSubmit = {
      height: totalHeightInches,
      weight: parseFloat(formData.weight),
      sex: formData.sex,
      activityLevel: formData.activityLevel,
      location: formData.location,
      age: parseInt(formData.age)
    };

    try {
      const response = await fetch('https://sweet-literally-pika.ngrok-free.app/api/formSubmit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...dataToSubmit,
          useGemini: isGeminiEnabled
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        result += chunk;

        try {
          // Try to parse the JSON data
          const data = JSON.parse(result);
          
          if (data.caloricIntake) {
            setCaloricIntake(data.caloricIntake);
            setLocalCaloricIntake(data.caloricIntake);
            setHasSubmitted(true);
            setLocalHasSubmitted(true);
            setIsLoading(false);
            Cookies.set('survivalProfile', JSON.stringify({
              ...formData,
              caloricIntake: data.caloricIntake,
              foragingRecommendations: data.foragingPara
            }), { expires: 30 });
          }
          
          if (data.foragingPara) {
            setForagingRecommendations(data.foragingPara);
            setLocalForagingRecommendations(data.foragingPara);
          }

          // Reset result for next chunk
          result = '';
        } catch (e) {
          // If JSON is incomplete, continue reading
          continue;
        }
      }
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeminiToggle = () => {
    setIsGeminiEnabled(!isGeminiEnabled);
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#8B4513] shadow-lg flex flex-col fade-in-card">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#FFA500] mb-8 text-center">Survival Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6 md:sticky md:top-4">
          {/* Height Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#FFA500]">Height</label>
            <div className="flex space-x-4">
              <input
                type="number"
                name="heightFeet"
                value={formData.heightFeet}
                onChange={handleChange}
                placeholder="Feet"
                min="0"
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                required
              />
              <input
                type="number"
                name="heightInches"
                value={formData.heightInches}
                onChange={handleChange}
                placeholder="Inches"
                min="0"
                max="11"
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                required
              />
            </div>
          </div>

          {/* Age Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#FFA500]">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              min="1"
              max="120"
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              required
            />
          </div>

          {/* Weight Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#FFA500]">Weight (lbs)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Enter your weight"
              min="0"
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              required
            />
          </div>

          {/* Sex Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#FFA500]">Sex</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Activity Level Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#FFA500]">Activity Level</label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              required
            >
              <option value="">Select</option>
              <option value="very_active">Very Active (Scavenging/Defending)</option>
              <option value="sedentary">Sedentary (Bunker Life)</option>
            </select>
          </div>

          {/* Location Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#FFA500]">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleLocationChange}
              placeholder="Enter your location"
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#FFA500] text-black rounded-md hover:bg-[#FF8C00] disabled:opacity-50"
          >
            {isLoading ? 'Calculating...' : 'Calculate Survival Needs'}
          </button>

          <DevToggle isEnabled={isGeminiEnabled} onToggle={handleGeminiToggle} />
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900 text-white rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurvivalProfile;

