import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapPlaceholder = () => {
  const mapContainerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/ackberry/cm9elpnwd006z01ry3yne9zeo/draft',
        center: [0, 20],
        zoom: 1.5,
        projection: 'globe'
      });

      map.on('style.load', () => {
        map.setFog({
          color: 'white',
          'horizon-blend': 0.1,
          range: [-1, 2]
        });
      });

      map.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map. Please check your connection and try again.');
      });

      return () => map.remove();
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please check your configuration.');
    }
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-96">
      {error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div 
          ref={mapContainerRef} 
          className="w-full h-full rounded-md"
          style={{ minHeight: '384px' }}
        />
      )}
    </div>
  );
};

export default MapPlaceholder;
