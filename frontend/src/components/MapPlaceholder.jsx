/*
// MapPlaceholder.jsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Hypothetical nuclear strike data
const strikeSites = [
  { lng: -122.4194, lat: 37.7749, yield: 100, burstType: 'surface' }, // San Francisco, 100kt
  { lng: -74.0060, lat: 40.7128, yield: 150, burstType: 'surface' },  // New York, 150kt
];

// Function to calculate radiation spread (three severity circles)
const calculateRadiation = (lng, lat, yieldKt, burstType) => {
  const features = [];
  const isSurfaceBurst = burstType === 'surface';
  // Severity levels: lethal, moderate, mild
  const severities = [
    { dose: isSurfaceBurst ? 500 : 300, radiusKm: 2 * Math.pow(yieldKt, 0.33) }, // Lethal
    { dose: isSurfaceBurst ? 100 : 50, radiusKm: 5 * Math.pow(yieldKt, 0.33) },  // Moderate
    { dose: isSurfaceBurst ? 10 : 5, radiusKm: 10 * Math.pow(yieldKt, 0.33) },   // Mild
  ];

  severities.forEach(({ dose, radiusKm }) => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      properties: {
        dose,
        radius: radiusKm * 1000, // Convert to meters
      },
    });
  });

  return { type: 'FeatureCollection', features };
};

const MapPlaceholder = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283],
      zoom: 3,
    });

    map.current.on('load', () => {
      strikeSites.forEach((site, index) => {
        const radiationGeoJSON = calculateRadiation(
          site.lng,
          site.lat,
          site.yield,
          site.burstType
        );

        if (map.current.getSource(`radiation-${index}`)) {
          map.current.removeSource(`radiation-${index}`);
        }
        map.current.addSource(`radiation-${index}`, {
          type: 'geojson',
          data: radiationGeoJSON,
        });

        if (map.current.getLayer(`radiation-circle-${index}`)) {
          map.current.removeLayer(`radiation-circle-${index}`);
        }
        map.current.addLayer({
          id: `radiation-circle-${index}`,
          type: 'circle',
          source: `radiation-${index}`,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'radius'],
              0,
              0,
              20000,
              30 / map.current.getZoom(), // Increased max radius for visibility
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'dose'],
              0,
              '#00ff00', // Mild
              50,
              '#ffff00', // Moderate
              300,
              '#ff0000', // Lethal
            ],
            'circle-opacity': 0.5, // Slightly lower for overlapping circles
          },
        });
      });

      strikeSites.forEach((site, index) => {
        if (map.current.getSource(`strike-${index}`)) {
          map.current.removeSource(`strike-${index}`);
        }
        map.current.addSource(`strike-${index}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [site.lng, site.lat],
            },
          },
        });

        if (map.current.getLayer(`strike-marker-${index}`)) {
          map.current.removeLayer(`strike-marker-${index}`);
        }
        map.current.addLayer({
          id: `strike-marker-${index}`,
          type: 'circle',
          source: `strike-${index}`,
          paint: {
            'circle-radius': 5 / map.current.getZoom(),
            'circle-color': '#ffffff',
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 2 / map.current.getZoom(),
          },
        });
      });

      map.current.on('zoom', () => {
        strikeSites.forEach((_, index) => {
          if (map.current.getLayer(`radiation-circle-${index}`)) {
            map.current.setPaintProperty(
              `radiation-circle-${index}`,
              'circle-radius',
              [
                'interpolate',
                ['linear'],
                ['get', 'radius'],
                0,
                0,
                20000,
                30 / map.current.getZoom(),
              ]
            );
          }
          if (map.current.getLayer(`strike-marker-${index}`)) {
            map.current.setPaintProperty(
              `strike-marker-${index}`,
              'circle-radius',
              5 / map.current.getZoom()
            );
            map.current.setPaintProperty(
              `strike-marker-${index}`,
              'circle-stroke-width',
              2 / map.current.getZoom()
            );
          }
        });
      });
    });

    return () => map.current.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100vh' }}
    />
  );
};

export default MapPlaceholder;
*/



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
        style: 'mapbox://styles/ackberry/cm9eytcw1007g01ry4kil3bvw/draft',
        center: [0, 0],
        zoom: 1.3,
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
    <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#8B4513] shadow-lg flex flex-col fade-in-card">
      <h2 className="text-2xl font-bold text-[#FF0000] mb-6">Danger Zones</h2>
      {error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="flex justify-center">
          <div 
            ref={mapContainerRef} 
            className="w-full aspect-square rounded-md"
            style={{ minHeight: '384px' }}
          />
        </div>
      )}
    </div>
  );
};

export default MapPlaceholder;
