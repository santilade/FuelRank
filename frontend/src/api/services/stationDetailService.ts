import client from '../client.ts';

import type { StationDetail } from '../../types/types.ts';
export const getStationDetail = async (station_id: string): Promise<StationDetail> => {
  try {
    return await client.get(`/stations/${station_id}`);
  } catch (error: any) {
    if (error.response) {
      //server returns status out of 2xx range
      const status = error.response.status;
      const message = error.response.data?.message || 'Server responded with an error';
      throw new Error(`Error ${status}: ${message}`);
    } else if (error.request) {
      //No answer from server
      throw new Error('No response from the server');
    } else {
      //unexpected
      throw new Error('An unexpected error occurred while fetching data');
    }
  }
};
