import requests
from datetime import datetime, timezone
import json
from dotenv import load_dotenv
import os
import time
import logging
from app.scrapers.base_scraper import BaseScraper

class OlisObscraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("OLIS_OB_API_URL")
        self.api_data = None
        self.contact_data = os.getenv("CONTACT")
    
    def fetch_api_data(self):
        response = requests.post(self.api_url)
        response.raise_for_status()
        self.api_data = response.json()
    
    def get_static_info(self):
        
        if self.api_data is None:
            self.fetch_api_data()

        olis_stations = []
        ob_stations = []
    
        for s in self.api_data["Items"]:
            try:
                if s["Type"] == 0:
                    olis_stations.append({
                        "station": s["Name"],
                        "address": s["Name"],
                        "longitude": None,
                        "latitude": None,
                        "region": None,
                        "url": None,
                    })

                else: 
                    ob_stations.append({
                    "station": s["Name"],
                        "address": s["Name"],
                        "longitude": None,
                        "latitude": None,
                        "region": None,
                        "url": None,
                })

            except Exception as e:
                self.logger.error(f"in station '{s.get('Name', '???')}': {e}")
                continue
        
        self.save_to_json({"stations": olis_stations}, "olis_static.json")
        self.save_to_json({"stations": ob_stations}, "ob_static.json")
    
    def update_single_brand(self, static_filename,type_filter, output_filename):
        """
        Updates fuel prices for a specific brand (Olís or ÓB), based on type filter.
        Parameters:
        - static_filename: Path to the static data JSON (e.g., "olis_static.json")
        - type_filter: Integer indicating brand (0 = Olís, 1 = ÓB)
        - output_filename: Where to save the updated price data
        """
        if self.api_data is None:
            self.fetch_api_data()

        # type 0 → Olís (main brand), type 1 → ÓB (low-cost brand)
        stations_dynamic = [
            s for s in self.api_data["Items"]
            if s["Type"] == type_filter
        ]
        stations_aux = {s["Name"]: s for s in stations_dynamic}

        with open(static_filename, "r", encoding="utf-8") as f:
            static_data = json.load(f)
        
        updated = []

        for station in static_data["stations"]:
            station_data = stations_aux.get(station["station"])

            if not station_data:
                self.logger.warning(f"No data for {station['station']}")
                continue

            gas_price = float(station_data["PricePetrol"]) if station_data.get("PricePetrol") else None
            diesel_price = float(station_data["PriceDiesel"]) if station_data.get("PriceDiesel") else None
            colored_diesel_price = float(station_data["ColoredDiesel"]) if station_data.get("ColoredDiesel") else None
            metan_price = float(station_data["PriceMetan"]) if station_data.get("PriceMetan") else None

            station.update({
                "gas_price": gas_price,
                "diesel_price": diesel_price,
                "colored_disel_price": colored_diesel_price,
                "metan_price": metan_price,
                "shipping_fuel_price": None,
                "gas_discount": None,
                "diesel_discount": None,
                "colored_diesel_discount": None,
                "shipping_fuel_discount": None
                })
            
            updated.append(station)

        timestamp = datetime.now(timezone.utc).isoformat()

        self.save_to_json({
            "timestamp": timestamp,
            "stations": updated
        }, output_filename)

        stations_brand = "Olis" if type_filter == 0 else "OB"

        self.logger.info(f"Updated prices for {len(updated)} {stations_brand} stations at {timestamp}")

    
    def update_prices(self):
        """
        Updates prices for both Olís and ÓB stations by calling the generic updater twice.

        Olís and ÓB are handled separately because they are stored in different static files
        and filtered by station type in the dynamic API response.
        """
        self.update_single_brand(static_filename="olis_static.json",type_filter=0,output_filename="olis_stations_prices.json")
        self.update_single_brand(static_filename="ob_static.json",type_filter=1,output_filename="ob_stations_prices.json")

if __name__ == "__main__":
    scraper = OlisObscraper()
    scraper.get_static_info()
    scraper.update_prices()



    