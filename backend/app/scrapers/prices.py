import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import json
from app.core.config import REGIONS


def extract_table_data(soup, div_id, fuel_type, region_name):
    stations = []
    container = soup.find("div", id=div_id)
    if not container: 
        return stations #return empty list
    
    rows = container.find_all("tr")[1:] #skip header
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 3 :
            continue
        try:
            station = {
                "company": cols[0].text.strip(),
                "station": cols[1].text.strip(),
                "price": float(cols[2].text.strip().replace(",", ".")),
                "type": fuel_type,
                "region": region_name
            }
            stations.append(station)
        except ValueError:
            continue 
    
    return stations

def scrape_all_regions():
    all_stations = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stations": []
    }

    for region in REGIONS:
        print(f"Scraping {region['name']}...")
        response = requests.get(region["url"])
        soup = BeautifulSoup(response.content,"html.parser")

        bensin95 = extract_table_data(soup, "okt95", "bensin95", region["name"])
        diesel = extract_table_data(soup, "disel", "diesel", region["name"])

        all_stations["stations"].extend(bensin95 + diesel)

    return all_stations

def save_to_json(data, filename="stations.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    #print(data)

if __name__ == "__main__":
    data = scrape_all_regions()
    save_to_json(data)
    print("Scraping done and saved")
