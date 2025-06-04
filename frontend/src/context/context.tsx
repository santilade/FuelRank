import { useTheme, useMediaQuery } from '@mui/material';
import React, { createContext, useContext, useEffect, useState } from 'react';

type SharedContextType = {
  lightMode: boolean;
  setLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  fuelType: string | null;
  setFuelType: React.Dispatch<React.SetStateAction<string | null>>;
  userCoords: GeolocationCoordinates | null;
  setUserCoords: React.Dispatch<React.SetStateAction<GeolocationCoordinates | null>>;
  closest: boolean;
  setClosest: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  region: string | null;
  setRegion: React.Dispatch<React.SetStateAction<string | null>>;
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pricesLoading: boolean;
  setPricesLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const throwFn = () => {
  throw new Error('SharedContext: no provider found.');
};

const defaultContext: SharedContextType = {
  lightMode: false,
  setLightMode: throwFn,
  fuelType: null,
  setFuelType: throwFn,
  userCoords: null,
  setUserCoords: throwFn,
  closest: false,
  setClosest: throwFn,
  isMobile: false,
  region: null,
  setRegion: throwFn,
  dialogOpen: false,
  setDialogOpen: throwFn,
  pricesLoading: false,
  setPricesLoading: throwFn,
};

export const SharedContext = createContext<SharedContextType>(defaultContext);

export const SharedProvider = ({ children }: { children: React.ReactNode }) => {
  const [lightMode, setLightMode] = useState(() => {
    const saved = localStorage.getItem('lightMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  });
  const [fuelType, setFuelType] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<GeolocationCoordinates | null>(null);
  const [closest, setClosest] = useState(false);
  const [region, setRegion] = useState<string | null>(null);

  const theme = useTheme();
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMobile, setIsMobile] = useState(isMobileQuery);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pricesLoading, setPricesLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(isMobileQuery);
  }, [isMobileQuery]);

  useEffect(() => {
    localStorage.setItem('lightMode', JSON.stringify(lightMode));
  }, [lightMode]);

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
        isMobile,
        region,
        setRegion,
        dialogOpen: dialogOpen,
        setDialogOpen: setDialogOpen,
        pricesLoading,
        setPricesLoading,
      }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedContext = () => useContext(SharedContext);
