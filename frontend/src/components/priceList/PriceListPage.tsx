import { useEffect, useMemo, useState } from 'react';
import { getLatestPrices } from './service';
import { useSharedContext } from '../shared/context';
import { haversineDistance } from '../../utils/geo';
import { formatDistance } from '../../utils/format';
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
import StationMap from './StationMap';

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
  const { fuelType, userCoords, setUserCoords, closest, isMobile } = useSharedContext();
  const [selectedStation, setSelectedStation] = useState<SelectedStation | null>(null);

  //const formatTime = (isoString: string) => {
  //  const date = new Date(isoString);
  //  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  //};

  const cleanStationName = (name: string, brand: string): string => {
    const normalizedBrand = brand.trim().toLocaleLowerCase();
    const normalizedName = name.trim().toLocaleLowerCase();

    if (normalizedName.startsWith(normalizedBrand)) {
      return name.slice(brand.length).trimStart();
    }
    return name;
  };

  const handleStationClick = (station: Station) => {
    setSelectedStation({
      station_id: station.station_id,
      station_name: cleanStationName(station.station_name, station.brand),
      address: station.address,
      coords: [station.lat, station.long],
    });
  };

  // get data
  useEffect(() => {
    getLatestPrices()
      .then((response) => {
        const data = response;

        if (Array.isArray(data)) {
          setStationList(data);
        } else {
          throw new Error('Wrong answer');
        }
      })
      .catch((err) => setError(err.message));
  }, []);

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
        height: '100vh',
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
          flexBasis: isMobile ? '100%' : '70%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <StationMap selectedStation={selectedStation} />
      </Box>
    </Box>
  );
};

export default PriceListPage;
