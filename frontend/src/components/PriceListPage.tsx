import { useEffect, useState } from 'react';
import { getLatestPrices } from './priceList/service';

type Price = {
  station_id: string;
  station_name: string;
  brand: string;
  address: string;
  fuel_type: string;
  price: number;
  discount: number;
  last_update: string;
};

const PriceListPage = () => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getLatestPrices()
      .then((response) => {
        const data = response;

        if (Array.isArray(data)) {
          console.log(data);
          setPrices(data);
        } else {
          throw new Error('Wrong answer');
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Price List</h1>
      <ul>
        {prices.map((p) => (
          <li key={`${p.station_id}${p.fuel_type}`}>
            Brand: {p.brand} <br />
            Name: {p.station_name} <br />
            address: {p.address} <br />
            Fuel type: {p.fuel_type} <br />
            Price: {p.price} <br />
            {p.discount !== null && (
              <p>
                Discount of: {p.discount} kr. <br />
              </p>
            )}
            Last update: {p.last_update} <br />
          </li>
        ))}{' '}
      </ul>
    </div>
  );
};

export default PriceListPage;
