import requests
from datetime import datetime, timezone
import json
import os
import time
from app.scrapers.base_scraper import BaseScraper


class OrkanScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("ORKAN_API_URL")
        self.api_data = None
        self.contact_data = os.getenv("CONTACT")

    def fetch_api_data(self):
        response = requests.post(self.api_url)
        response.raise_for_status()
        self.api_data = response.json()

    def get_coordinates(self, address, counter):
        try:
            params = {"q": address, "format": "json", "limit": 1}
            headers = {"User-Agent": f"FuelRank ({self.contact_data})"}

            response = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params=params,
                headers=headers,
            )
            response.raise_for_status()

            data = response.json()

            if data:
                self.logger.info(f"Coords for {address} found")
                counter[0] += 1
                return float(data[0]["lon"]), float(data[0]["lat"])
            else:
                self.logger.warning(f"No coords found for {address}")
                return None, None

        except Exception as e:
            self.logger.error(f"Geocodifying error '{address}': {e}")
            return None, None

    def get_static_info(self):

        if self.api_data is None:
            self.fetch_api_data()

        stations = []
        counter = [0]

        for s in self.api_data["value"]["priceList"]["price"]:
            try:

                name = s["name"]
                brand = "orkan"

                # extracting coordinates
                lon, lat = self.get_coordinates(name, counter)
                time.sleep(1)

                station_id = self.generate_station_id(brand, name)

                stations.append(
                    {
                        "id": station_id,
                        "brand": brand,
                        "name": s["name"],
                        "address": s["name"],
                        "longitude": lon,
                        "latitude": lat,
                        "region": None,
                        "url": None,
                    }
                )
            except Exception as e:
                self.logger.error(f"in station '{s.get('Name', '???')}': {e}")
                continue

        self.update_json_static({"stations": stations}, "orkan_static.json")
        self.logger.info(f"{len(stations)} stations fetched from api")
        self.logger.info(f"geocoords for {counter} stations")

    def update_prices(self, static_filename="orkan_static.json"):

        if self.api_data is None:
            self.fetch_api_data()

        stations_aux = {
            s["name"]: s for s in self.api_data["value"]["priceList"]["price"]
        }
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
                    "colored_disel_price": price_diesel_c,
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

        self.save_to_json(data, "orkan_prices.json")
        self.logger.info(f"{len(updated)} stations prices updated {ts}")
