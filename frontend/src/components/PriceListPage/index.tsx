import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStations } from '../../api/services/pricesService.ts';
import { useSharedContext } from '../../context/context.tsx';
import { haversineDistance } from '../../utils/geo.ts';
import { formatDistance } from '../../utils/format.ts';
import { cleanStationName } from '../../utils/stationNameCleaner.ts';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Paper,
  Skeleton,
  Alert,
} from '@mui/material';
import StationMap from './StationMap.tsx';
import StationDetailDialog from './StationDetailDialog.tsx';
import type { Station, SelectedStation } from '../../types/types.ts';

const PriceListPage = () => {
  const [allStationList, setAllStationList] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {
    fuelType,
    userCoords,
    setUserCoords,
    closest,
    isMobile,
    region,
    setDialogOpen,
    pricesLoading,
    setPricesLoading,
  } = useSharedContext();
  const [selectedStation, setSelectedStation] = useState<SelectedStation | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  //const formatTime = (isoString: string) => {
  //  const date = new Date(isoString);
  //  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  //};

  const handleStationClick = useCallback(
    (station: Station) => {
      setSelectedStation({
        station_id: station.station_id,
        station_name: cleanStationName(station.station_name, station.brand),
        address: station.address,
        coords: [station.lat, station.long],
      });

      setSelectedStationId(station.station_id);
      setDialogOpen(true);
    },
    [setDialogOpen]
  );

  // get data
  useEffect(() => {
    setPricesLoading(true);

    getStations(region ?? undefined)
      .then((response) => {
        if (Array.isArray(response)) {
          setAllStationList(response);
        } else {
          throw new Error('Wrong answer');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setPricesLoading(false));
  }, [region]);

  const filteredStations = fuelType
    ? allStationList.filter((station) => station.fuel_type.toLowerCase() === fuelType)
    : allStationList;

  // get user coords
  useEffect(() => {
    let mounted = true;

    if (!userCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mounted) {
            setUserCoords(position.coords);
          }
        },
        (error) => {
          if (mounted) {
            console.error('Error obtaining device position: ', error);
          }
        }
      );
    }
    return () => {
      mounted = false;
    };
  }, []);

  const sortedStations = useMemo(() => {
    const list = [...filteredStations];

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
  }, [filteredStations, closest, userCoords]);

  if (error) {
    console.error(error);

    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}. Please try reloading
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        maxWidth: '100%',
        width: '100%',
        gap: 1,
        px: 1,
      }}
    >
      <Box
        sx={{
          flex: isMobile ? '100%' : '30%',
          maxWidth: { xs: '100%', sm: 400 },
          overflow: 'auto',
          height: isMobile ? 'auto' : '100%',
        }}
      >
        {sortedStations.length > 0 && !isMobile && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 2, pt: 1, display: 'block' }}
          >
            Last update: {new Date(sortedStations[0].last_update).toLocaleString()}
          </Typography>
        )}
        <List>
          {pricesLoading
            ? [...Array(10)].map((_, index) => (
                <Skeleton key={index} variant="rounded" height={70} sx={{ mb: 1 }} />
              ))
            : sortedStations.map((station) => (
                <Paper
                  key={`${station.fuel_type}-${station.station_id}`}
                  elevation={5}
                  square={false}
                  sx={{ mb: 1 }}
                >
                  <ListItemButton onClick={() => handleStationClick(station)}>
                    <ListItemAvatar>
                      <Avatar
                        src={`/logos/${station.brand.toLocaleLowerCase()}.png`}
                        alt=""
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
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {!isMobile && (
          <>
            <StationMap selectedStation={selectedStation} onMapReady={() => setMapReady(true)} />
            {!mapReady && (
              <Skeleton
                variant="rectangular"
                height="100%"
                width="100%"
                sx={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
              />
            )}
          </>
        )}
      </Box>
      {isMobile && <StationDetailDialog stationId={selectedStationId} />}
    </Box>
  );
};

export default PriceListPage;
