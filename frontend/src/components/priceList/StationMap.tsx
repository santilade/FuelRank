import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box } from '@mui/material';
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
            <Box>{selectedStation.station_name}</Box>
          </Popup>
        </Marker>
      )}
      <MapEffect selectedStation={selectedStation} />
    </MapContainer>
  );
};

export default StationMap;
