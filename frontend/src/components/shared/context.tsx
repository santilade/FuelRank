import React, { createContext, useContext, useState } from 'react';

type SharedContextType = {
  lightMode: boolean;
  setLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  fuelType: string | null;
  setFuelType: React.Dispatch<React.SetStateAction<string | null>>;
  userCoords: GeolocationCoordinates | null;
  setUserCoords: React.Dispatch<React.SetStateAction<GeolocationCoordinates | null>>;
};

const defaultContext: SharedContextType = {
  lightMode: false,
  setLightMode: () => {},
  fuelType: null,
  setFuelType: () => {},
  userCoords: null,
  setUserCoords: () => {},
};

export const SharedContext = createContext<SharedContextType>(defaultContext);

export const SharedProvider = ({ children }: { children: React.ReactNode }) => {
  const [lightMode, setLightMode] = useState(false);
  const [fuelType, setFuelType] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<GeolocationCoordinates | null>(null);

  return (
    <SharedContext.Provider
      value={{ lightMode, setLightMode, fuelType, setFuelType, userCoords, setUserCoords }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedContext = () => useContext(SharedContext);
