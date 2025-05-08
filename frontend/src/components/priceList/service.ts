import client from '../../api/client.ts';

const priceListUrl = '/prices?fuel=GAS&fuel=DIESEL&limit=100';

export const getLatestPrices = () => {
  return client.get(priceListUrl);
};
