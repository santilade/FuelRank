import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStationDetail } from './service';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { useSharedContext } from '../shared/context';
import { cleanStationName } from '../../utils/stationNameCleaner';

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
  const { isMobile } = useSharedContext();

  useEffect(() => {
    if (id) {
      getStationDetail(id)
        .then((res) => setStation(res))
        .catch((err) => setError(err.message));
    }
  }, [id]);

  const lastUpdate = station ? (Object.values(station.prices)[0]?.last_update ?? null) : null;

  if (error) return <div>Error: {error}</div>;
  if (!station) return <div>Loading...</div>;
  console.log(station);

  return (
    <Box p={2} maxWidth="md" mx="auto">
      <Card variant="outlined">
        <CardHeader
          avatar={
            <Avatar
              src={`/logos/${station.brand.toLocaleLowerCase()}.png`}
              variant="rounded"
              sx={{ mb: 2, width: 56, height: 56 }}
            />
          }
          title={
            <Typography variant="h5">{cleanStationName(station.name, station.brand)}</Typography>
          }
          subheader={station.brand}
        />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: 'stretch',
            }}
          >
            {/* STATION INFO */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignSelf: { md: 'stretch' },
                }}
                elevation={4}
              >
                <a
                  href={`https://www.google.com/maps?q=${station.lat},${station.long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ all: 'unset', cursor: 'pointer' }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {station.region}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} my={1}>
                    <img
                      src="/map-icons/google-maps-icon.svg"
                      alt="Open in Google maps"
                      width={20}
                      height={20}
                      style={{ cursor: 'pointer' }}
                    />
                    <Typography>{station.address}</Typography>
                  </Box>
                </a>
                <Typography variant="caption">
                  Last price update: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A'}
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
              </Paper>
            </Box>

            {isMobile && <Divider sx={{ my: 2 }} />}

            {/* PRICES*/}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {Object.entries(station.prices).map(([fuelType, fuel]) => (
                <Paper key={fuelType} sx={{ p: 2, mb: 2 }} elevation={4}>
                  <Typography variant="h6">{fuelType}</Typography>
                  <Typography>Price: {fuel.price} ISK</Typography>

                  {fuel.discount !== null && (
                    <Typography>
                      With discount: {(fuel.price - fuel.discount).toFixed(1)} ISK
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StationDetailPage;
