import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapPlaceholder = ({ location }) => {
  const mapContainerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/ackberry/cm9eytcw1007g01ry4kil3bvw/draft',
        center: [0, 0],
        zoom: 0.0,
        projection: 'globe'
      });

      window.map = map;

      // Smooth zoom-in animation after map loads
      map.on('load', () => {
        if (location) {
          // Geocode the location to get coordinates
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}`)
            .then(response => response.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                map.flyTo({
                  center: [lng, lat],
                  zoom: 5.5,
                  speed: 1.5,
                  curve: 1.2,
                  essential: true
                });
              }
            })
            .catch(err => {
              console.error('Error geocoding location:', err);
              // Fallback to default location if geocoding fails
              map.flyTo({
                center: [-80.1223, 26.3683],
                zoom: 5.5,
                speed: 1.5,
                curve: 1.2,
                essential: true
              });
            });
        } else {
          // Default location if no location is provided
          map.flyTo({
            center: [-80.1223, 26.3683],
            zoom: 5,
            speed: 1.5,
            curve: 1.2,
            essential: true
          });
        }
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
  }, [location]); // Add location to dependency array

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#8B4513] shadow-lg flex flex-col fade-in-card relative z-0">
      <h2 className="text-2xl font-bold text-[#FF0000] mb-6">Danger Zones</h2>
      {error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="flex justify-center">
          <div 
            ref={mapContainerRef} 
            className="w-full aspect-square rounded-md relative z-0"
            style={{ minHeight: '384px' }}
          />
        </div>
      )}
    </div>
  );
};

export default MapPlaceholder;
