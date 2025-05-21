import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStationDetail } from './service';
import { Avatar, Box, Divider, Paper, Typography } from '@mui/material';

type FuelPrice = {
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

const StationDetailPage = () => {
  const { id } = useParams();
  const [station, setStation] = useState<StationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getStationDetail(id)
        .then((res) => setStation(res))
        .catch((err) => setError(err.message));
    }
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!station) return <div>Loading...</div>;
  console.log(station);

  return (
    <Box p={2}>
      <Avatar src={`/logos/${station.brand.toLocaleLowerCase()}.png`} variant="rounded" />
      <Typography variant="h5">{station.name}</Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {station.brand}
      </Typography>
      <a
        href={`https://www.google.com/maps?q=${station.lat},${station.long}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ all: 'unset', cursor: 'pointer' }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>{station.address}</Typography>
          <img
            src="/map-icons/google-maps-icon.svg"
            alt="Open in Google maps"
            width={20}
            height={20}
            style={{ cursor: 'pointer' }}
          />
        </Box>
      </a>
      <Typography variant="body2" color="text.secondary">
        {station.region}
      </Typography>
      {/**
       TODO: Links to official site from backend
      {station.url && (
        <a
          href={station.url}
          target="_blank"
          rel="noopener"
          style={{ textDecoration: 'underline' }}
        >
          Visit official site
        </a>
      )}
        */}
      <Divider sx={{ my: 2 }} />
      {Object.entries(station.prices).map(([fuelType, fuel]) => (
        <Paper key={fuelType} sx={{ p: 2, mb: 1 }} elevation={5}>
          <Typography variant="h6">{fuelType}</Typography>
          <Typography>Price: {fuel.price} ISK</Typography>

          {fuel.discount !== null && (
            <Typography>With discount: {(fuel.price - fuel.discount).toFixed(1)} ISK</Typography>
          )}

          <Typography variant="caption">
            Last update: {new Date(fuel.last_update).toLocaleString()}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default StationDetailPage;
