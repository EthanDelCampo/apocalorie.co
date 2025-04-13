{foragingRecommendations && (
  <div className="mt-8 p-6 bg-[#2b2b14] border border-[#8B4513] rounded-lg">
    <h2 className="text-2xl font-bold text-[#FFA500] mb-4">Survival Guide</h2>
    
    {foragingRecommendations
      .split('\n\n') // Split by blank lines
      .filter(Boolean) // Remove empty sections
      .map((entry, index) => {
        const [title, ...facts] = entry.split('\n'); // First line = title, rest = facts
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold text-[#FFA500] mb-2">{title}</h3>
            <p className="text-base leading-relaxed text-white">{facts.join(' ')}</p>
          </div>
        );
      })}
  </div>
)}
