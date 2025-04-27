import requests
from datetime import datetime, timezone
import json
import os
import time
from app.data_collectors.base_collector import BaseCollector


class OrkanCollector(BaseCollector):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("ORKAN_API_URL")
        self.static_filename = "orkan_static.json"

    def get_HTTP_method(self):
        return "POST"

    def get_station_name(self, station):
        return station["name"]

    def fetch_api_data(self):
        """Adapted to Orkan's nested JSON structure"""

        method = self.get_HTTP_method().upper()

        if method == "GET":
            response = requests.get(self.api_url)
        elif method == "POST":
            response = requests.post(self.api_url)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        response.raise_for_status()
        full_response = response.json()

        try:
            self.api_data = full_response["value"]["priceList"]["price"]
        except KeyError:
            raise ValueError("Unexpected API response structure from Orkan.")

    def build_new_station(self, station):
        name = station["name"]
        address = station["name"]  # no address data from endpoint
        brand = "orkan"
        id = self.generate_station_id(brand, name, address=None)
        url = None

        search_data = address
        lon, lat, region = self.get_location_data(search_data, id)
        time.sleep(1)

        return {
            "id": id,
            "brand": brand,
            "name": name,
            "address": address,
            "longitude": lon,
            "latitude": lat,
            "region": region,
            "url": url,
        }

    def update_prices(self, static_filename="orkan_static.json"):

        if self.api_data is None:
            self.fetch_api_data()

        stations_aux = {s["name"]: s for s in self.api_data}
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
                float(station_api_data["okt95"].replace(",", "."))
                if station_api_data.get("okt95")
                else None
            )
            price_diesel = (
                float(station_api_data["disel"].replace(",", "."))
                if station_api_data.get("disel")
                else None
            )
            price_diesel_c = (
                float(station_api_data["velaolia"].replace(",", "."))
                if station_api_data.get("velaolia")
                else None
            )
            price_electric = (
                float(station_api_data["rafmagn"].replace(",", "."))
                if station_api_data.get("rafmagn")
                else None
            )

            station.update(
                {
                    "gas_price": price_gas,
                    "diesel_price": price_diesel,
                    "colored_diesel_price": price_diesel_c,
                    "price_electric": price_electric,
                    "shipping_fuel_price": None,
                    "gas_discount": None,
                    "diesel_discount": None,
                    "colored_diesel_discount": None,
                    "shipping_fuel_discount": None,
                }
            )

            updated.append(station)

            ts = datetime.now(timezone.utc).isoformat()
            data = {"timestamp": ts, "stations": updated}

        self.save_to_json(data, "orkan_stations_prices.json")
        self.logger.info(f"{len(updated)} stations prices updated {ts}")


if __name__ == "__main__":
    scraper = OrkanCollector()
    scraper.get_static_info()
    scraper.update_prices()
