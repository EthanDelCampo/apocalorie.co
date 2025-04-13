import React from 'react';

const DevToggle = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center justify-center mt-4">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isEnabled}
          onChange={onToggle}
        />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:content-[''] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFA500]"></div>
        <span className="ml-2 text-sm font-medium text-gray-300">Gemini API</span>
      </label>
    </div>
  );
};

export default DevToggle; 