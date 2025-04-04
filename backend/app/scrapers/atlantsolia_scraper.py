import requests
from datetime import datetime, timezone
import json
from dotenv import load_dotenv
import os
import time
import logging
from app.scrapers.base_scraper import BaseScraper

class AtlansoliaScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("ATLANSOLIA_API_URL")
    
    def get_static_info(self):
        response = requests.get(self.api_url)
        response.raise_for_status()

        stations_raw = response.json()

        stations = []

        for s in stations_raw:
            try:
                stations.append({
                    "station": s["Name"],
                    "address": s["Address"],
                    "longitude": s["Longitude"],
                    "latitude": s["Latitude"],
                    "region": None,
                    "url": s["Url"],
                })
            
            except Exception as e:
                self.logger.error(f"in station '{s.get('Name', '???')}': {e}")
                continue
        
        self.save_to_json({"stations": stations}, "atlantsolia_static.json")
    
    def update_prices(self, static_filename="atlantsolia_static.json"):
        with open(static_filename, "r", encoding="utf-8") as f:
            static_data = json.load(f)
        
        response = requests.get(self.api_url)
        response.raise_for_status()
        stations_dynamic = response.json()

        stations_aux = {s["Name"]: s for s in stations_dynamic}

        updated = []

        for station in static_data["stations"]:
            station_api_data = stations_aux.get(station["station"])

            if not station_api_data:
                self.logger.warning(f"No data for {station['station']}")
                continue
        
            gas_price = float(station_api_data["PriceOct95"]) if station_api_data.get("PriceOct95") else None
            diesel_price = float(station_api_data["PriceDiesel"]) if station_api_data.get("PriceDiesel") else None
            colored_disel_price = float(station_api_data["PriceEngineOil"]) if station_api_data.get("PriceEngineOil") else None
            shipping_fuel_price = float(station_api_data["PriceShippingOil"]) if station_api_data.get("PriceShippingOil") else None

            # Only assign a gas discount if both the discount value exists and the gas price is non-zero.
            # This prevents storing misleading discounts for fuels that are not actually available at the station.
            gas_discount = float(station_api_data["Oct95Discount"]) if station_api_data.get("Oct95Discount") and gas_price else None
            diesel_discount = float(station_api_data["DieselDiscount"]) if station_api_data.get("DieselDiscount") and diesel_price else None
            colored_diesel_discount = float(station_api_data["EngineOilDiscount"]) if station_api_data.get("EngineOilDiscount") and colored_disel_price else None
            shipping_fuel_discount = float(station_api_data["ShippingOilDiscount"]) if station_api_data.get("ShippingOilDiscount") and shipping_fuel_price else None

            station.update({
                "gas_price": gas_price,
                "diesel_price": diesel_price,
                "colored_disel_price": colored_disel_price,
                "shipping_fuel_price": shipping_fuel_price,
                "gas_discount": gas_discount,
                "diesel_discount": diesel_discount,
                "colored_diesel_discount": colored_diesel_discount,
                "shipping_fuel_discount": shipping_fuel_discount
            })

            updated.append(station)
        
        timestamp = datetime.now(timezone.utc).isoformat()

        self.save_to_json({
            "timestamp": timestamp,
            "stations": updated
        }, "atlantsolia_prices.json")

        self.logger.info(f"Updated prices for {len(updated)} Atlantsolia stations at {timestamp}")

if __name__ == "__main__":
    scraper = AtlansoliaScraper()
    scraper.get_static_info()
    scraper.update_prices()

           