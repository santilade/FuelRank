import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSharedContext } from '../../context/context.tsx';
import { getStationDetail } from '../../api/services/stationDetailService.ts';
import { cleanStationName } from '../../utils/stationNameCleaner.ts';
import type { StationDetail, StationMapsProps, SelectedStation } from '../../types/types.ts';

const userIcon = new Icon({
  iconUrl: '/map-icons/userIcon.svg',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const stationIcon = new Icon({
  iconUrl: '/map-icons/stationIcon.svg',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const MapEffect = ({ selectedStation }: { selectedStation: SelectedStation | null }) => {
  const { userCoords } = useSharedContext();
  const map = useMap();

  useEffect(() => {
    if (userCoords && selectedStation) {
      const bounds = new LatLngBounds([
        [userCoords.latitude, userCoords.longitude],
        selectedStation.coords,
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (userCoords) {
      map.setView([userCoords.latitude, userCoords.longitude], 13);
    } else if (selectedStation) {
      map.setView(selectedStation.coords, 13);
    }
  }, [userCoords, selectedStation, map]);

  return null;
};

const StationMap = ({ selectedStation, onMapReady }: StationMapsProps) => {
  const { userCoords, isMobile } = useSharedContext();
  const [station, setStation] = useState<StationDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const markerRef = useRef<LeafletMarker>(null);

  const defaultCenter: [number, number] = userCoords
    ? [userCoords.latitude, userCoords.longitude]
    : [64.1423306, -21.9275197]; // Reykjavik coords

  useEffect(() => {
    if (selectedStation) {
      setIsLoading(true);
      getStationDetail(selectedStation.station_id)
        .then(setStation)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setStation(null);
    }
  }, [selectedStation]);

  useEffect(() => {
    if (markerRef.current && selectedStation && !isMobile) {
      requestAnimationFrame(() => {
        markerRef.current?.openPopup();
      });
    }
  }, [selectedStation]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      whenReady={onMapReady}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userCoords && (
        <Marker position={[userCoords.latitude, userCoords.longitude]} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}
      {selectedStation && (
        <Marker position={selectedStation.coords} icon={stationIcon} ref={markerRef}>
          {!isMobile && (
            <Popup>
              {isLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minWidth={150}
                  minHeight={80}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : station ? (
                <Box>
                  <Typography variant="subtitle1">
                    {station.brand}, {cleanStationName(station.name, station.brand)}
                  </Typography>

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
                        width={10}
                        height={10}
                        style={{ cursor: 'pointer' }}
                      />
                      <Typography variant="subtitle2">{station.address}</Typography>
                    </Box>
                  </a>

                  <Box
                    mt={1}
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="center"
                    gap={3}
                  >
                    {Object.entries(station.prices).map(([fuelType, fuel]) => (
                      <Box
                        key={fuelType}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          lineHeight: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ lineHeight: 1, fontWeight: 600, fontSize: '1rem' }}
                        >
                          {fuelType}
                        </Typography>
                        <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                          {fuel.price} ISK
                        </Typography>
                        {fuel.discount !== null && (
                          <Typography variant="caption" sx={{ lineHeight: 1 }}>
                            Discounted: {(fuel.price - fuel.discount).toFixed(1)} ISK
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2">No data available.</Typography>
              )}
            </Popup>
          )}
        </Marker>
      )}
      <MapEffect selectedStation={selectedStation} />
    </MapContainer>
  );
};

export default StationMap;
