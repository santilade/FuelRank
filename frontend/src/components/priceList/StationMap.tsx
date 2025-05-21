import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography } from '@mui/material';
import { useSharedContext } from '../shared/context';
import { useEffect } from 'react';

type StationMapsProps = {
  selectedStation: {
    station_id: string;
    station_name: string;
    address: string;
    coords: [number, number];
  } | null;
};

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

const MapEffect = ({ selectedStation }: StationMapsProps) => {
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
    }
  }, [userCoords, selectedStation, map]);

  return null;
};

const StationMap = ({ selectedStation }: StationMapsProps) => {
  const { userCoords } = useSharedContext();

  const defaultCenter: [number, number] = userCoords
    ? [userCoords.latitude, userCoords.longitude]
    : [64.1423306, -21.9275197]; // Reykjavik coords

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
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
        <Marker position={selectedStation.coords} icon={stationIcon}>
          <Popup>
            <Box>
              <Typography variant="subtitle1">{selectedStation.station_name}</Typography>
              <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
                <Box component="span" display="inline-flex" alignItems="center" gap={1}>
                  <img
                    src="/map-icons/google-maps-icon.svg"
                    alt="Open in Google Maps"
                    width={20}
                    height={20}
                    style={{ cursor: 'pointer' }}
                  />
                  <a
                    href={`https://www.google.com/maps?q=${selectedStation.coords[0]},${selectedStation.coords[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Typography variant="subtitle2">{selectedStation.address}</Typography>
                  </a>
                </Box>
                <Box component="span" display="inline-flex" alignItems="center" gap={1}>
                  <img
                    src="/map-icons/magnifying-glass-icon.svg"
                    alt="View station detailes"
                    width={14}
                    height={14}
                    style={{ cursor: 'pointer' }}
                  />
                  <a href={`/station/${selectedStation.station_id}`}>
                    <Typography variant="subtitle2">Station details</Typography>
                  </a>
                </Box>
              </Box>
            </Box>
          </Popup>
        </Marker>
      )}
      <MapEffect selectedStation={selectedStation} />
    </MapContainer>
  );
};

export default StationMap;
