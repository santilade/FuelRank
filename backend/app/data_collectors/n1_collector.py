from app.settings import N1_ENDPOINT
from datetime import datetime, timezone
import json
import time
from app.data_collectors.base_collector import BaseCollector

# TODO: n1 EV charging prices


class N1Collector(BaseCollector):
    def __init__(self):
        super().__init__()
        self.endpoint_url = N1_ENDPOINT
        self.static_filename = "n1_static.json"

    def get_HTTP_method(self):
        return "POST"

    def get_station_name(self, station):
        return station["Name"]

    def build_new_station(self, station):
        name = station["Name"]
        address = station["Location"]
        brand = "n1"
        id = self.generate_station_id(brand, name, address)
        url = station["Url"]

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

    def update_prices(self):

        if self.api_data is None:
            self.fetch_api_data()

        stations_aux = {s["Name"]: s for s in self.api_data}
        static_file = self.data_dir / self.static_filename

        with open(static_file, "r", encoding="utf-8") as f:
            static_data = json.load(f)

        updated = []

        for station in static_data["stations"]:
            station_api_data = stations_aux.get(station["name"])

            if not station_api_data:
                self.logger.warning(f"No data for {station['name']}")
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
                    "colored_diesel_price": price_diesel_c,
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


if __name__ == "__main__":
    collector = N1Collector()
    collector.get_static_info()
    collector.update_prices()
