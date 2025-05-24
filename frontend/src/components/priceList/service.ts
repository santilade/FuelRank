import client from '../../api/client.ts';

export const getLatestPrices = (region?: string) => {
  const baseUrl = `/prices?fuel=GAS&fuel=DIESEL`;
  const url = region ? `${baseUrl}&region=${region}` : baseUrl;
  return client.get(url);
};
