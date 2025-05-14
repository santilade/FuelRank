import React, { createContext, useContext, useState } from 'react';

type SharedContextType = {
  lightMode: boolean;
  setLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  fuelType: string | null;
  setFuelType: React.Dispatch<React.SetStateAction<string | null>>;
  userCoords: GeolocationCoordinates | null;
  setUserCoords: React.Dispatch<React.SetStateAction<GeolocationCoordinates | null>>;
  closest: boolean;
  setClosest: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultContext: SharedContextType = {
  lightMode: false,
  setLightMode: () => {},
  fuelType: null,
  setFuelType: () => {},
  userCoords: null,
  setUserCoords: () => {},
  closest: false,
  setClosest: () => {},
};

export const SharedContext = createContext<SharedContextType>(defaultContext);

export const SharedProvider = ({ children }: { children: React.ReactNode }) => {
  const [lightMode, setLightMode] = useState(false);
  const [fuelType, setFuelType] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<GeolocationCoordinates | null>(null);
  const [closest, setClosest] = useState(false);

  return (
    <SharedContext.Provider
      value={{
        lightMode,
        setLightMode,
        fuelType,
        setFuelType,
        userCoords,
        setUserCoords,
        closest,
        setClosest,
      }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedContext = () => useContext(SharedContext);
