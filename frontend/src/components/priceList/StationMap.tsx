import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import { useSharedContext } from '../shared/context';
import { useEffect } from 'react';

const StationMap = () => {
  const { userCoords } = useSharedContext();

  const defaultCenter: [number, number] = userCoords
    ? [userCoords.latitude, userCoords.longitude]
    : [64.1355, -21.8954]; // Reykjavik coords

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
        <Marker position={[userCoords.latitude, userCoords.longitude]}>
          <Popup>Your Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default StationMap;
