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
  const [prices, setPrices] = useState<Price[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    getLatestPrices()
      .then((response) => {
        const data = response;

        if (Array.isArray(data)) {
          setPrices(data);
        } else {
          throw new Error('Wrong answer');
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <List>
      {prices.map((p) => (
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
