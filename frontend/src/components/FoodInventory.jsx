import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const FoodInventory = ({ onCaloriesChange }) => {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = React.useRef(null);

  // Load saved inventory from cookies
  useEffect(() => {
    const savedInventory = Cookies.get('foodInventory');
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (error) {
        console.error('Error parsing saved inventory:', error);
      }
    }
  }, []);

  // Save inventory to cookies whenever it changes
  useEffect(() => {
    Cookies.set('foodInventory', JSON.stringify(inventory), { expires: 30 });
  }, [inventory]);

  // Update parent component when inventory changes
  useEffect(() => {
    const total = calculateTotalCalories();
    if (onCaloriesChange) {
      onCaloriesChange(total);
    }
  }, [inventory, onCaloriesChange]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('https://sweet-literally-pika.ngrok-free.app/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: searchQuery })
      });
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.results || []);
      setShowSuggestions(true);
      setSuggestions(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addToInventory = (entry) => {
    setInventory(prev => [...prev, { entry, quantity: 1 }]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const updateQuantity = (index, newQuantity) => {
    const quantity = Math.max(0, Number(newQuantity));
    setInventory(prev => {
      const newInventory = [...prev];
      newInventory[index] = { ...newInventory[index], quantity };
      return newInventory;
    });
  };

  const removeFromInventory = (index) => {
    setInventory(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotalCalories = () => {
    return inventory.reduce((total, item) => {
      const calories = parseFloat(item.entry.labelNutrients?.calories?.value || 100);
      const quantity = parseInt(item.quantity);
      return total + (calories * quantity);
    }, 0);
  };

  return (
    <div className="relative max-w-4xl mx-auto p-6 bg-[#1a1a1a] rounded-lg border border-[#8B4513] shadow-lg fade-in-card">
      <h2 className="text-2xl font-bold text-[#FFA500] mb-6">Food Inventory</h2>

      {/* Inventory List */}
      <div className="space-y-2 mb-8">
        {inventory.map((item, index) => (
          <div key={index} className="p-4 bg-[#2b2b14] border border-[#8B4513] rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[#FFA500] font-semibold">{item.entry.brandedFoodCategory || item.entry.description}</h3>
                <p className="text-gray-300">
                  Calories: {item.entry.labelNutrients?.calories?.value || 100} per serving
                </p>
                {item.entry.description && (
                  <p className="text-gray-400 text-sm mt-1">
                    {item.entry.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(index, e.target.value)}
                    min="0"
                    step="1"
                    className="w-20 px-3 py-1 bg-[#2a2a2a] border border-[#8B4513] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                  />
                </div>
                <button
                  onClick={() => removeFromInventory(index)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Section */}
      <div className={`relative w-full mb-8 transition-all duration-300 ${showSuggestions && searchResults.length > 0 ? 'min-h-[280px]' : 'min-h-[80px]'}`}>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for food..."
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#8B4513] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
            />
            {/* Search Results */}
            {showSuggestions && searchResults.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-[#8B4513] rounded-md shadow-lg z-[100] max-h-[240px] overflow-y-auto"
              >
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-[#3a3a2a] cursor-pointer text-white"
                    onClick={() => addToInventory(result.entry)}
                  >
                    <h3 className="text-[#FFA500] font-semibold">{result.entry.brandedFoodCategory || result.entry.description}</h3>
                    <p className="text-gray-300 text-sm">
                      Calories: {result.entry.labelNutrients?.calories?.value || 100} per serving
                    </p>
                    {result.entry.description && (
                      <p className="text-gray-400 text-xs mt-1">
                        {result.entry.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 bg-[#FFA500] text-black rounded-md hover:bg-[#FF8C00] disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FoodInventory;




  