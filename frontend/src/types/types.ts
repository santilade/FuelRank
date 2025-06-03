import type { ReactNode } from 'react';

export type FuelPrice = {
  price: number;
  discount: number | null;
  last_update: string;
};

export type StationDetail = {
  id: string;
  name: string;
  brand: string;
  address: string;
  lat: number;
  long: number;
  url: string;
  region: string;
  prices: {
    [fuelType: string]: FuelPrice;
  };
};

export type Station = {
  station_id: string;
  station_name: string;
  brand: string;
  address: string;
  lat: number;
  long: number;
  fuel_type: string;
  price: number;
  discount: number;
  last_update: string;
};

export type SelectedStation = {
  station_id: string;
  station_name: string;
  address: string;
  coords: [number, number];
};

export type StationMapsProps = {
  selectedStation: {
    station_id: string;
    station_name: string;
    address: string;
    coords: [number, number];
  } | null;
  onMapReady: () => void;
};

export type HeaderProps = {
  title: string;
};

export type LayoutProps = {
  title: string;
  children: ReactNode;
};
