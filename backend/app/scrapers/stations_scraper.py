import requests
from datetime import datetime, timezone
import json
from dotenv import load_dotenv
import os

load_dotenv()
API_URL = os.getenv("N1_API_URL")

def scrape_n1_from_api():
    response = requests.post(API_URL)
    response.raise_for_status()

    stations_raw = response.json()

    stations = []

    for s in stations_raw:
        try:
            prices = {}
            if s["GasPrice"]:
                prices["Gas"] = float(s["GasPrice"].replace(",", "."))

            if s["DiselPrice"]:
                prices["Diesel"] = float(s["DiselPrice"].replace(",", "."))

            if s["ColoredDiselPrice"]:
                prices["ColoredDiesel"] = float(s["ColoredDiselPrice"].replace(",", "."))
            
            stations.append({
                    "station": s["Name"],
                    "address": s["Location"],
                    "region": s["Region"],
                    "url": s["Url"],
                    "prices": prices
                })
        except Exception as e:
            print(f"Error in station '{s.get('Name', '???')}': {e}")
    
    return {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "stations": stations
    }

def save_to_json(data, filename="n1_stations.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    data = scrape_n1_from_api()
    save_to_json(data)
    print(f"Scraping N1 completed. {len(data['stations'])} stations saved")