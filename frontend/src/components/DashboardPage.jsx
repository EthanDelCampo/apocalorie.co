{foragingRecommendations && (
  <div className="mt-8 p-6 bg-[#2b2b14] border border-[#8B4513] rounded-lg">
    <h2 className="text-2xl font-bold text-[#FFA500] mb-4">Foraging Recommendations</h2>
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: foragingRecommendations }}
    />
  </div>
)} 