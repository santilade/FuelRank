import requests
from datetime import datetime, timezone
import json
import os
from app.scrapers.base_scraper import BaseScraper


class AtlansoliaScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("ATLANSOLIA_API_URL")
        self.api_data = None

    def fetch_api_data(self):
        response = requests.get(self.api_url)
        response.raise_for_status()
        self.api_data = response.json()

    def get_static_info(self):
        if self.api_data is None:
            self.fetch_api_data()

        stations = []

        for s in self.api_data:
            try:
                stations.append(
                    {
                        "station": s["Name"],
                        "address": s["Address"],
                        "longitude": s["Longitude"],
                        "latitude": s["Latitude"],
                        "region": None,
                        "url": s["Url"],
                    }
                )

            except Exception as e:
                self.logger.error(f"in station '{s.get('Name', '???')}': {e}")
                continue

        static_filename = "atlantsolia_static.json"
        self.update_json_static({"stations": stations}, static_filename)
        self.logger.info(f"{len(stations)} stations from api")

    def update_prices(self, static_filename="atlantsolia_static.json"):

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

        self.save_to_json(data, "atlantsolia_prices.json")

        self.logger.info(f"{len(updated)} stations prices updated {ts}")
