import requests
from datetime import datetime, timezone
import json
import os
import time
from app.scrapers.base_scraper import BaseScraper


class OlisObscraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("OLIS_OB_API_URL")
        self.api_data = None
        self.contact_data = os.getenv("CONTACT")

    def fetch_api_data(self):
        response = requests.get(self.api_url)
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
            self.logger.error(f"Geocodifying error '{address}: {e}")
            return None, None

    def get_static_info(self):

        if self.api_data is None:
            self.fetch_api_data()

        olis_stations = []
        ob_stations = []
        counter = [0]

        for s in self.api_data["Items"]:
            try:
                brand = "Olis" if s["Type"] == 0 else "Ob"
                search_data = f"{brand} {s['Name']}"
                lon, lat = self.get_coordinates(search_data, counter)
                time.sleep(1)

                station_data = {
                    "station": s["Name"],
                    "address": s["Name"],
                    "longitude": lon,
                    "latitude": lat,
                    "region": None,
                    "url": None,
                }

                if brand == "Olis":
                    olis_stations.append(station_data)
                else:
                    ob_stations.append(station_data)

            except Exception as e:
                self.logger.error(f"in station '{s.get('Name', '???')}': {e}")
                continue

        self.save_to_json({"stations": olis_stations}, "olis_static.json")
        self.save_to_json({"stations": ob_stations}, "ob_static.json")

    def update_single_brand(self, static_filename, type_filter, output_file):
        """
        Updates fuel prices for a specific brand (Olís or ÓB), based on type.
        Parameters:
        - static_file: Path to the static data JSON (e.g., "olis_static.json")
        - type_filter: Integer indicating brand (0 = Olís, 1 = ÓB)
        - output_file: Where to save the updated price data
        """
        if self.api_data is None:
            self.fetch_api_data()

        # type 0 → Olís (main brand), type 1 → ÓB (low-cost brand)
        stations_dynamic = [
            s for s in self.api_data["Items"] if s["Type"] == type_filter
        ]
        stations_aux = {s["Name"]: s for s in stations_dynamic}
        static_file = self.data_dir / static_filename

        with open(static_file, "r", encoding="utf-8") as f:
            static_data = json.load(f)

        updated = []

        for station in static_data["stations"]:
            station_data = stations_aux.get(station["station"])

            if not station_data:
                self.logger.warning(f"No data for {station['station']}")
                continue

            price_gas = (
                float(station_data["PricePetrol"])
                if station_data.get("PricePetrol")
                else None
            )
            price_diesel = (
                float(station_data["PriceDiesel"])
                if station_data.get("PriceDiesel")
                else None
            )
            price_diesel_c = (
                float(station_data["ColoredDiesel"])
                if station_data.get("ColoredDiesel")
                else None
            )
            price_metan = (
                float(station_data["PriceMetan"])
                if station_data.get("PriceMetan")
                else None
            )

            station.update(
                {
                    "gas_price": price_gas,
                    "diesel_price": price_diesel,
                    "colored_disel_price": price_diesel_c,
                    "metan_price": price_metan,
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

        self.save_to_json(data, output_file)

        stations_brand = "Olis" if type_filter == 0 else "OB"
        self.logger.info(f"{len(updated)} {stations_brand} prices @ {ts}")

    def update_prices(self):
        """
        Updates prices for Olís and ÓB by calling the updater twice.

        Each uses a different static file and is filtered by station type.
        """

        self.update_single_brand(
            static_filename="olis_static.json",
            type_filter=0,
            output_file="olis_stations_prices.json",
        )
        self.update_single_brand(
            static_filename="ob_static.json",
            type_filter=1,
            output_file="ob_stations_prices.json",
        )
