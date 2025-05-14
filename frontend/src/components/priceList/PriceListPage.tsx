import { useEffect, useMemo, useState } from 'react';
import { getLatestPrices } from './service';
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
import { useSharedContext } from '../shared/context';
import { haversineDistance } from '../../utils/geo';

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
  const { fuelType, userCoords, setUserCoords, closest } = useSharedContext();

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

  const formatDistance = (
    userLat: number,
    userLong: number,
    stationLat: number,
    stationLong: number
  ): string => {
    const distance = haversineDistance(userLat, userLong, stationLat, stationLong);
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(distance)} m`;
    }
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
          console.log('location obtained: ', position.coords);
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
    <List>
      {sortedPriceList.map((p) => (
        <Paper key={`${p.fuel_type}${p.station_id}`} elevation={5} square={false} sx={{ mb: 1 }}>
          <ListItemButton>
            <ListItemAvatar>
              <Avatar src={`/logos/${p.brand.toLocaleLowerCase()}.png`} variant="rounded" />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" color="text.primary">
                    {cleanStationName(p.station_name, p.brand)}
                    <Typography>{p.price} ISK</Typography>
                  </Typography>
                  <Typography component="span" variant="body2" color="text.primary">
                    {p.brand}
                  </Typography>
                </Box>
              }
              secondary={
                <Box display="flex" alignItems="center" gap={1}>
                  {userCoords ? (
                    <Typography component="span" variant="body2" color="text.primary">
                      {formatDistance(userCoords.latitude, userCoords.longitude, p.lat, p.long)}
                    </Typography>
                  ) : (
                    <Typography component="span" variant="body2" color="text.primary">
                      No distance data
                    </Typography>
                  )}
                  <Typography component="span" variant="body2" color="text.secondary">
                    {p.discount !== null && `Discount: ${p.discount} ISK`}
                  </Typography>
                </Box>
              }
            />
          </ListItemButton>
        </Paper>
      ))}
    </List>
  );
};

export default PriceListPage;
