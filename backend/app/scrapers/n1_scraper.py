import requests
from datetime import datetime, timezone
import json
from dotenv import load_dotenv
import os
import time
import logging
from app.scrapers.base_scraper import BaseScraper

#TODO: n1 EV charging prices

class N1Scraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("N1_API_URL")
        self.contact_data = os.getenv("CONTACT")
        
    #TODO: normalize and fallback for get_coordinates
    def get_coordinates(self, address, counter):
        try:
            params ={
                "q": address,
                "format": "json",
                "limit": 1
            }
            headers = {
                "User-Agent": f"FuelRank ({self.contact_data})"
            }

            response = requests.get("https://nominatim.openstreetmap.org/search", params=params, headers=headers)
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

    def get_static_info(self):
        response = requests.post(self.api_url)
        response.raise_for_status()

        stations_raw = response.json()

        stations = []
        counter = [0]

        for s in stations_raw:
            try:
                #extracting coordinates
                longitude, latitude = self.get_coordinates(s["Location"], counter)
                time.sleep(1)
                
                stations.append({
                        "station": s["Name"],
                        "address": s["Location"],
                        "longitude": longitude,
                        "latitude": latitude,
                        "region": s["Region"],
                        "url": s["Url"],
                    })
            except Exception as e:
                self.logger.error(f"in station '{s.get('Name', '???')}': {e}")
                continue
                
        print(f"{counter[0]} stations found")
        self.save_to_json({"stations": stations}, "n1_static.json")  

    def update_prices(self, static_filename="n1_static.json"):
        with open(static_filename, "r", encoding="utf-8") as f:
            static_data = json.load(f)
        
        response = requests.post(self.api_url)
        response.raise_for_status()
        stations_dynamic = response.json()

        stations_aux = {s["Name"]: s for s in stations_dynamic}

        updated = []

        for station in static_data["stations"]:
            station_api_data = stations_aux.get(station["station"])

            if not station_api_data:
                self.logger.warning(f"No data for {station['station']}")
                continue

            gas_price = float(station_api_data["GasPrice"].replace(",", ".")) if station_api_data.get("GasPrice") else None
            diesel_price = float(station_api_data["DiselPrice"].replace(",", ".")) if station_api_data.get("DiselPrice") else None
            colored_disel_price = float(station_api_data["ColoredDiselPrice"].replace(",", ".")) if station_api_data.get("ColoredDiselPrice") else None

            station.update({
                "gas_price": gas_price,
                "diesel_price": diesel_price,
                "colored_disel_price": colored_disel_price,
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
        }, "n1_stations_prices.json")

        self.logger.info(f"Updated prices for {len(updated)} N1 stations at {timestamp}")


if __name__ == "__main__":
    scraper = N1Scraper()
    scraper.get_static_info()
    scraper.update_prices()