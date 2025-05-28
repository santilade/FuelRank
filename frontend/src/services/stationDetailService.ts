import client from '../api/client.ts';

import type { StationDetail } from '../types/types.ts';
export const getStationDetail = (station_id: string): Promise<StationDetail> => {
  return client.get(`/stations/${station_id}`);
};
