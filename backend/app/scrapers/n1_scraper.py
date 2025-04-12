import requests
from datetime import datetime, timezone
import json
import os
import time
from app.scrapers.base_scraper import BaseScraper

# TODO: n1 EV charging prices


class N1Scraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("N1_API_URL")
        self.api_data = None
        self.contact_data = os.getenv("CONTACT")

    def fetch_api_data(self):
        response = requests.post(self.api_url)
        response.raise_for_status()
        self.api_data = response.json()

    # TODO: normalize and fallback for get_coordinates
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
            self.logger.error(f"Geocodifying error '{address}: {e}")
            return None, None

    def get_static_info(self):
        if self.api_data is None:
            self.fetch_api_data()

        stations = []
        counter = [0]

        for s in self.api_data:
            try:
                # extracting coordinates
                lon, lat = self.get_coordinates(s["Location"], counter)
                time.sleep(1)

                stations.append(
                    {
                        "station": s["Name"],
                        "address": s["Location"],
                        "longitude": lon,
                        "latitude": lat,
                        "region": s["Region"],
                        "url": s["Url"],
                    }
                )
            except Exception as e:
                self.logger.error(f"in station '{s.get('Name', '???')}': {e}")
                continue

        self.update_json_static({"stations": stations}, "n1_static.json")
        self.logger.info(f"{len(stations)} stations from api")
        self.logger.info(f"geocoords for {counter} stations")

    def update_prices(self, static_filename="n1_static.json"):

        if self.api_data is None:
            self.fetch_api_data()

        stations_aux = {s["Name"]: s for s in self.api_data}
        static_file = self.data_dir / static_filename

        with open(static_file, "r", encoding="utf-8") as f:
            static_data = json.load(f)

        updated = []

        for station in static_data["stations"]:
            station_api_data = stations_aux.get(station["station"])

            if not station_api_data:
                self.logger.warning(f"No data for {station['station']}")
                continue

            price_gas = (
                float(station_api_data["GasPrice"].replace(",", "."))
                if station_api_data.get("GasPrice")
                else None
            )
            price_diesel = (
                float(station_api_data["DiselPrice"].replace(",", "."))
                if station_api_data.get("DiselPrice")
                else None
            )
            price_diesel_c = (
                float(station_api_data["ColoredDiselPrice"].replace(",", "."))
                if station_api_data.get("ColoredDiselPrice")
                else None
            )

            station.update(
                {
                    "gas_price": price_gas,
                    "diesel_price": price_diesel,
                    "colored_disel_price": price_diesel_c,
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

        self.save_to_json(data, "n1_stations_prices.json")

        self.logger.info(f"{len(updated)} stations prices updated {ts}")
