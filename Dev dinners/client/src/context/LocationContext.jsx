import React, { createContext, useContext, useState, useEffect } from 'react';

const HYDERABAD_HUBS = [
  { name: 'Hitec City / Madhapur', lng: 78.3846, lat: 17.4486 },
  { name: 'Jubilee Hills (Road 36)', lng: 78.4068, lat: 17.4334 },
  { name: 'Banjara Hills (Road 3)', lng: 78.4482, lat: 17.4241 },
  { name: 'Gachibowli (Financial District)', lng: 78.3498, lat: 17.44 },
  { name: 'Secunderabad (MG Road)', lng: 78.4878, lat: 17.4411 },
  { name: 'Charminar / Old City', lng: 78.4747, lat: 17.3616 },
];

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  // Default to Hitec City, Hyderabad
  const [currentLocation, setCurrentLocation] = useState({
    name: 'Hitec City, Hyderabad',
    lng: 78.3846,
    lat: 17.4486,
    isGPS: false,
  });
  const [detectingGPS, setDetectingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Auto-detect browser GPS on load if permission granted
  const detectBrowserLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setCurrentLocation({
          name: 'Current Live GPS Location',
          lng: parseFloat(longitude.toFixed(4)),
          lat: parseFloat(latitude.toFixed(4)),
          isGPS: true,
        });
        setDetectingGPS(false);
      },
      (error) => {
        console.warn('[Geolocation Warning]', error.message);
        setGpsError('GPS permission denied or unavailable. Using default Hyderabad area.');
        setDetectingGPS(false);
      },
      { timeout: 8000 }
    );
  };

  const selectManualLocation = (hub) => {
    setCurrentLocation({
      name: hub.name,
      lng: hub.lng,
      lat: hub.lat,
      isGPS: false,
    });
    setGpsError(null);
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        detectingGPS,
        gpsError,
        detectBrowserLocation,
        selectManualLocation,
        hubs: HYDERABAD_HUBS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

