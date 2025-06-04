import client from '../client.ts';
import type { Station } from '../../types/types.ts';
import { handleApiError } from '../utils/handleApiError.ts';

export const getStations = async (region?: string): Promise<Station[]> => {
  const baseUrl = `/prices?fuel=GAS&fuel=DIESEL`;
  const url = region ? `${baseUrl}&region=${region}` : baseUrl;
  try {
    return await client.get(url);
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
};
