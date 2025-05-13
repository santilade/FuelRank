import React, { createContext, useContext, useState } from 'react';

type SharedContextType = {
  lightMode: boolean;
  setLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  fuelType: string | null;
  setFuelType: React.Dispatch<React.SetStateAction<string | null>>;
};

const defaultContext: SharedContextType = {
  lightMode: false,
  setLightMode: () => {},
  fuelType: null,
  setFuelType: () => {},
};

export const SharedContext = createContext<SharedContextType>(defaultContext);

export const SharedProvider = ({ children }: { children: React.ReactNode }) => {
  const [lightMode, setLightMode] = useState(false);
  const [fuelType, setFuelType] = useState<string | null>(null);

  return (
    <SharedContext.Provider value={{ lightMode, setLightMode, fuelType, setFuelType }}>
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedContext = () => useContext(SharedContext);
