import { useEffect, useState } from 'react';
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

type Price = {
  station_id: string;
  station_name: string;
  brand: string;
  address: string;
  fuel_type: string;
  price: number;
  discount: number;
  last_update: string;
};

const PriceListPage = () => {
  const [pricelist, setPricelist] = useState<Price[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { fuelType, userCoords, setUserCoords } = useSharedContext();

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

  if (error) return <div>Error: {error}</div>;

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
  });

  return (
    <List>
      {filteredPricelist.map((p) => (
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
                <>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {p.discount !== null && `Discount: ${p.discount} ISK`}
                  </Typography>
                </>
              }
            />
          </ListItemButton>
        </Paper>
      ))}
    </List>
  );
};

export default PriceListPage;
