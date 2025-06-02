import { useEffect, useRef, useState } from 'react';
import { useSharedContext } from './shared/context.tsx';
import { getStationDetail } from '../services/stationDetailService.ts';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Divider,
  Paper,
  Typography,
  Slide,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import { cleanStationName } from '../utils/stationNameCleaner.ts';
import StationMap from './StationMap.tsx';
import type { StationDetail } from '../types/types.ts';

const StationDetailDialog = ({ stationId }: { stationId: string | null }) => {
  const [station, setStation] = useState<StationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isMobile, dialogOpen, setDialogOpen } = useSharedContext();
  const initialFocusRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setDialogOpen(false);
    setStation(null);
    setError(null);
  };

  useEffect(() => {
    if (stationId) {
      setIsLoading(true);
      setStation(null);

      getStationDetail(stationId)
        .then((res) => setStation(res))
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [stationId]);

  useEffect(() => {
    if (dialogOpen) {
      document.activeElement instanceof HTMLElement && document.activeElement.blur();
    }
  }, [dialogOpen]);

  const lastUpdate = station ? (Object.values(station.prices)[0]?.last_update ?? null) : null;

  if (error) return <div>Error: {error}</div>;
  //TODO: ERROR state
  //TODO: LOADING state

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      scroll="body"
      slots={{ transition: Slide }}
      slotProps={{
        transition: {
          direction: 'up',
          onEnter: () => initialFocusRef.current?.focus(),
        },
        container: {
          style: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            minHeight: '100dvh',
            paddingTop: '1rem',
            boxSizing: 'border-box',
          },
        },
      }}
    >
      {!station || isLoading ? (
        <DialogContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}
        >
          <CircularProgress size={48} />
        </DialogContent>
      ) : (
        <DialogContent
          sx={{
            p: 0,
            display: { xs: 'block', md: 'flex' },
            flexDirection: 'column',
            justifyContent: { md: 'center' },
            minHeight: { xs: 'auto', md: '70vh' },
            overflowY: { xs: 'visible', md: 'hidden' },
          }}
        >
          <Card variant="outlined" sx={{ width: '100%' }}>
            <CardHeader
              sx={{ p: 1 }}
              avatar={
                <Avatar
                  src={`/logos/${station.brand.toLocaleLowerCase()}.png`}
                  variant="rounded"
                  sx={{ mb: 0.5, width: 56, height: 56 }}
                />
              }
              title={
                <Typography variant="h5">
                  {cleanStationName(station.name, station.brand)}
                </Typography>
              }
              subheader={`${station.brand}, ${station.region}`}
            />
            <CardContent sx={{ pt: 1, pb: 0, '&:last-child': { pb: 0.25 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 0.5, md: 2 },
                  alignItems: 'stretch',
                }}
              >
                {/* STATION INFO */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {isMobile && station && (
                    <>
                      <Divider sx={{ m: 1 }} />
                      <Box sx={{ height: 170 }}>
                        <StationMap
                          selectedStation={{
                            station_id: station.id,
                            station_name: station.name,
                            address: station.address,
                            coords: [station.lat, station.long],
                          }}
                        />
                      </Box>
                      <Divider sx={{ my: 1 }} />
                    </>
                  )}
                  <a
                    href={`https://www.google.com/maps?q=${station.lat},${station.long}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ all: 'unset', cursor: 'pointer' }}
                  >
                    <Box display="flex" alignItems="center" gap={1} my={1}>
                      <img
                        src="/map-icons/google-maps-icon.svg"
                        alt="Open in Google maps"
                        width={16}
                        height={16}
                        style={{ cursor: 'pointer' }}
                      />
                      <Typography>{station.address}</Typography>
                    </Box>
                  </a>
                </Box>

                {/* PRICES */}
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {Object.entries(station.prices).map(([fuelType, fuel]) => (
                    <Paper
                      key={fuelType}
                      sx={{
                        flex: 1,
                        p: { xs: 1, md: 2 },
                        minWidth: { xs: '45%', md: '100%' },
                        mb: { xs: 0, md: 2 },
                      }}
                      elevation={4}
                    >
                      <Typography variant="h6">{fuelType}</Typography>
                      <Typography>{fuel.price} ISK</Typography>
                      {fuel.discount !== null && (
                        <Typography variant="caption">
                          Discounted: {(fuel.price - fuel.discount).toFixed(1)} ISK
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
                <Typography variant="caption" color="grey">
                  Last price update: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default StationDetailDialog;
