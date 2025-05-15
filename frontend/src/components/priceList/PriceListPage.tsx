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

type Price = {
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

const PriceListPage = () => {
  const [pricelist, setPricelist] = useState<Price[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { fuelType, userCoords, setUserCoords, closest, isMobile } = useSharedContext();

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

  // get data
  useEffect(() => {
    getLatestPrices()
      .then((response) => {
        const data = response;

        if (Array.isArray(data)) {
          setPricelist(data);
        } else {
          throw new Error('Wrong answer');
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const filteredPricelist = fuelType
    ? pricelist.filter((p) => p.fuel_type.toLowerCase() === fuelType)
    : pricelist;

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

  //TODO: mapa con geolocalizacion de estaciones y usuario

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
          {sortedPriceList.map((p) => (
            <Paper
              key={`${p.fuel_type}${p.station_id}`}
              elevation={5}
              square={false}
              sx={{ mb: 1 }}
            >
              <ListItemButton>
                <ListItemAvatar>
                  <Avatar src={`/logos/${p.brand.toLocaleLowerCase()}.png`} variant="rounded" />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography component="div">
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" color="text.primary">
                            {cleanStationName(p.station_name, p.brand)}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.primary">
                            {userCoords
                              ? formatDistance(
                                  userCoords.latitude,
                                  userCoords.longitude,
                                  p.lat,
                                  p.long
                                )
                              : 'No distance data'}
                          </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="flex-end">
                          <Typography variant="body2" color="text.secondary">
                            {p.fuel_type}
                          </Typography>
                          <Typography>{p.price} ISK</Typography>
                          <Typography component="span" variant="body2" color="text.secondary">
                            {p.discount !== null &&
                              `With discount: ${(p.price - p.discount).toFixed(1)}`}
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
        <StationMap />
      </Box>
    </Box>
  );
};

export default PriceListPage;
