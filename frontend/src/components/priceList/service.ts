import client from '../../api/client.ts';

export const getLatestPrices = (region?: string) => {
  const limit = '100';
  const baseUrl = `/prices?fuel=GAS&fuel=DIESEL&limit=${limit}`;
  const url = region ? `/prices?region=${region}&fuel=GAS&fuel=DIESEL` : baseUrl;
  return client.get(url);
};
