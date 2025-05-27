import client from '../../api/client.ts';

import type { StationDetail } from './StationDetailModal.tsx';

export const getStationDetail = (station_id: string): Promise<StationDetail> => {
  return client.get(`/stations/${station_id}`);
};
