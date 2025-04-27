import requests
from datetime import datetime, timezone
import json
import os
import time
from app.data_collectors.base_collector import BaseCollector


class AtlansoliaCollector(BaseCollector):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("ATLANSOLIA_API_URL")
        self.static_filename = "atlantsolia_static.json"

    def get_region_from_coords(self, lat, lon, name):
        try:
            url = "https://nominatim.openstreetmap.org/reverse"

            params = {
                "lat": lat,
                "lon": lon,
                "format": "json",
                "zoom": 10,
                "addressdetails": 1,
            }
            headers = {"User-Agent": f"FuelRank ({self.contact_data})"}

            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            # print(data)

            address = data.get("address", {})
            region = (
                address.get("state_district")
                or address.get("state")
                or address.get("county")
            )

            if region:
                self.logger.info(f"Region for {name} found!")
                return region
            else:
                self.logger.warning(f"No region for {name} found")
                return None

        except Exception as e:
            self.logger.error(f"Reverse Geocoding error: {e}")
            return None

    def get_HTTP_method(self):
        return "GET"

    def get_station_name(self, station):
        return station["Name"]

    def build_new_station(self, station):
        lat = station["Latitude"]
        lon = station["Longitude"]
        name = station["Name"]
        address = station["Address"]
        brand = "atlantsolia"
        id = self.generate_station_id(brand, name, address)
        region = self.get_region_from_coords(lat, lon, name)
        time.sleep(1)

        return {
            "id": id,
            "brand": brand,
            "name": name,
            "address": address,
            "longitude": lon,
            "latitude": lat,
            "region": region,
            "url": f"/stodvar/{station['Url'].rstrip('/').split('/')[-1].lower()}/",
        }

    def update_prices(self, static_filename="atlantsolia_static.json"):

        if self.api_data is None:
            self.fetch_api_data()

        stations_aux = {s["Name"]: s for s in self.api_data}

        static_file = self.data_dir / static_filename

        with open(static_file, "r", encoding="utf-8") as f:
            static_data = json.load(f)

        updated = []

        for station in static_data["stations"]:
            station_api_data = stations_aux.get(station["name"])

            if not station_api_data:
                self.logger.warning(f"No data for {station['name']}")
                continue

            price_gas = (
                float(station_api_data["PriceOct95"])
                if station_api_data.get("PriceOct95")
                else None
            )
            price_diesel = (
                float(station_api_data["PriceDiesel"])
                if station_api_data.get("PriceDiesel")
                else None
            )
            price_diesel_c = (
                float(station_api_data["PriceEngineOil"])
                if station_api_data.get("PriceEngineOil")
                else None
            )
            price_s_fuel = (
                float(station_api_data["PriceShippingOil"])
                if station_api_data.get("PriceShippingOil")
                else None
            )

            discount_gas = (
                float(station_api_data["Oct95Discount"])
                if station_api_data.get("Oct95Discount") and price_gas
                else None
            )
            discount_diesel = (
                float(station_api_data["DieselDiscount"])
                if station_api_data.get("DieselDiscount") and price_diesel
                else None
            )
            discount_diesel_c = (
                float(station_api_data["EngineOilDiscount"])
                if station_api_data.get("EngineOilDiscount") and price_diesel_c
                else None
            )
            discount_s_fuel = (
                float(station_api_data["ShippingOilDiscount"])
                if station_api_data.get("ShippingOilDiscount") and price_s_fuel
                else None
            )

            station.update(
                {
                    "gas_price": price_gas,
                    "diesel_price": price_diesel,
                    "colored_diesel_price": price_diesel_c,
                    "shipping_fuel_price": price_s_fuel,
                    "gas_discount": discount_gas,
                    "diesel_discount": discount_diesel,
                    "colored_diesel_discount": discount_diesel_c,
                    "shipping_fuel_discount": discount_s_fuel,
                }
            )

            updated.append(station)

        ts = datetime.now(timezone.utc).isoformat()
        data = {"timestamp": ts, "stations": updated}

        self.save_to_json(data, "atlantsolia_stations_prices.json")

        self.logger.info(f"{len(updated)} stations prices updated {ts}")


if __name__ == "__main__":
    collector = AtlansoliaCollector()
    collector.get_static_info()
    collector.update_prices()
