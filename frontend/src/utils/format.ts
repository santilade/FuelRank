import { haversineDistance } from './geo';

export const formatDistance = (
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
