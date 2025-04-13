import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Cookies from 'js-cookie';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const SurvivalProfile = ({ setHasSubmitted, setCaloricIntake }) => {
    // State management
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

    // Load saved data from cookies on component mount
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

    // Handle click outside suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Location handling
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

    // Form handling
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSubmit)
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            const data = await response.json();
            if (data.caloricIntake) {
                setCaloricIntake(data.caloricIntake);
                setHasSubmitted(true);
                // Save form data and caloric intake to cookies
                Cookies.set('survivalProfile', JSON.stringify({
                    ...formData,
                    caloricIntake: data.caloricIntake
                }), { expires: 30 }); // Cookie expires in 30 days
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            setError('Failed to submit form. Please try again.');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-[#FFA500] mb-8 text-center">Survival Profile</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Height Section */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#FFA500]">Height</label>
                        <div className="flex space-x-4">
                            <div className="flex-1">
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
                            </div>
                            <div className="flex-1">
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
                        <div className="relative" ref={suggestionsRef}>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleLocationChange}
                                placeholder="Enter your location"
                                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                                required
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-[#2a2a2a] border border-[#8B4513] rounded-md shadow-lg">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="px-4 py-2 hover:bg-[#3a3a3a] cursor-pointer text-white"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-md">
                            <p className="text-white">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
  type="submit"
  disabled={isLoading}
  className={`w-full bg-[#d97706] hover:bg-[#92400e] active:bg-[#78350f] text-[#1a1a1a] font-extrabold py-3 px-6 rounded-lg border-4 border-[#78350f] shadow-lg hover:shadow-sm active:shadow-inner transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {isLoading ? 'Calculating...' : 'Calculate Caloric Needs'}
</button>


                </form>
            </div>
        </div>
    );
};

export default SurvivalProfile;

