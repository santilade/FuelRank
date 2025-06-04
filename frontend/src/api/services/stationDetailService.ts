import client from '../client.ts';
import { handleApiError } from '../utils/handleApiError.ts';
import type { StationDetail } from '../../types/types.ts';

export const getStationDetail = async (station_id: string): Promise<StationDetail> => {
  try {
    return await client.get(`/stations/${station_id}`);
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
};
