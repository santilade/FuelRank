import { useEffect, useMemo, useState } from 'react';
import { getLatestPrices } from '../services/pricesService.ts';
import { useSharedContext } from './shared/context.tsx';
import { haversineDistance } from '../utils/geo.ts';
import { formatDistance } from '../utils/format.ts';
import { cleanStationName } from '../utils/stationNameCleaner.ts';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import StationMap from './StationMap.tsx';
import StationDetailModal from './StationDetailModal.tsx';

type Station = {
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

type SelectedStation = {
  station_id: string;
  station_name: string;
  address: string;
  coords: [number, number];
};

const PriceListPage = () => {
  const [stationList, setStationList] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { fuelType, userCoords, setUserCoords, closest, isMobile, region, setModalState } =
    useSharedContext();
  const [selectedStation, setSelectedStation] = useState<SelectedStation | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  //const formatTime = (isoString: string) => {
  //  const date = new Date(isoString);
  //  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  //};

  const handleStationClick = (station: Station) => {
    setSelectedStation({
      station_id: station.station_id,
      station_name: cleanStationName(station.station_name, station.brand),
      address: station.address,
      coords: [station.lat, station.long],
    });

    setSelectedStationId(station.station_id);
    setModalState(true);
  };

  // get data
  useEffect(() => {
    getLatestPrices(region ?? undefined)
      .then((response) => {
        const data = response;

        if (Array.isArray(data)) {
          setStationList(data);
        } else {
          throw new Error('Wrong answer');
        }
      })
      .catch((err) => setError(err.message));
  }, [region]);

  const filteredPricelist = fuelType
    ? stationList.filter((station) => station.fuel_type.toLowerCase() === fuelType)
    : stationList;

  // get user coords
  useEffect(() => {
    if (!userCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords(position.coords);
        },
        (error) => {
          console.error('Error obtaining device position: ', error);
        }
      );
    }
  }, [userCoords]);

  const sortedPriceList = useMemo(() => {
    const list = [...filteredPricelist];

    if (closest && userCoords) {
      list.sort((a, b) => {
        const distA = haversineDistance(userCoords.latitude, userCoords.longitude, a.lat, a.long);
        const distB = haversineDistance(userCoords.latitude, userCoords.longitude, b.lat, b.long);
        return distA - distB;
      });
    } else {
      list.sort((a, b) => a.price - b.price);
    }
    return list;
  }, [filteredPricelist, closest, userCoords]);

  if (error) return <div>Error: {error}</div>;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        maxWidth: '100%',
        width: '100%',
        gap: 1,
        px: isMobile ? 1 : 1,
      }}
    >
      <Box
        sx={{
          flex: isMobile ? '100%' : '30%',
          overflow: 'auto',
          height: isMobile ? 'auto' : '100%',
        }}
      >
        <List>
          {sortedPriceList.map((station) => (
            <Paper
              key={`${station.fuel_type}${station.station_id}`}
              elevation={5}
              square={false}
              sx={{ mb: 1 }}
            >
              <ListItemButton onClick={() => handleStationClick(station)}>
                <ListItemAvatar>
                  <Avatar
                    src={`/logos/${station.brand.toLocaleLowerCase()}.png`}
                    variant="rounded"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography component="div">
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" color="text.primary">
                            {cleanStationName(station.station_name, station.brand)}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.primary">
                            {userCoords
                              ? formatDistance(
                                  userCoords.latitude,
                                  userCoords.longitude,
                                  station.lat,
                                  station.long
                                )
                              : 'No distance data'}
                          </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="flex-end">
                          <Typography variant="body2" color="text.secondary">
                            {station.fuel_type}
                          </Typography>
                          <Typography>{station.price} ISK</Typography>
                          <Typography component="span" variant="body2" color="text.secondary">
                            {station.discount !== null &&
                              `With discount: ${(station.price - station.discount).toFixed(1)}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Typography>
                  }
                />
              </ListItemButton>
            </Paper>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          flexBasis: isMobile ? '0%' : '70%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {!isMobile && <StationMap selectedStation={selectedStation} />}
      </Box>
      {isMobile && <StationDetailModal stationId={selectedStationId} />}
    </Box>
  );
};

export default PriceListPage;
