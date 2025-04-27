from datetime import datetime, timezone
import json
import os
from app.data_collectors.base_collector import BaseCollector


class OlisObCollector(BaseCollector):
    def __init__(self):
        super().__init__()
        self.api_url = os.getenv("OLIS_OB_API_URL")
        self.contact_data = os.getenv("CONTACT")

    def get_HTTP_method(self):
        return "GET"

    def get_station_name(self, station):
        return station["Name"]

    def build_new_station(self, station):
        brand = "Olis" if station["Type"] == 0 else "Ob"
        name = (station["Name"],)
        address = station[
            "Name"
        ]  # No address data, "Name usually includes location of the station "
        id = self.generate_station_id(brand, name, address=None)

        search_data = f"{brand}, {name}"

        lon, lat, region = self.get_location_data(search_data, id)

        return {
            "id": id,
            "brand": brand,
            "name": name,
            "address": address,
            "longitude": lon,
            "latitude": lat,
            "region": region,
            "url": None,
        }

    def get_static_info(self):
        """
        Custom get_static_info for Olís and ÓB stations.
        This collector generates two separate static files (olis_static.json
        and ob_static.json),so the base get_static_info() method is overridden.
        """
        if self.api_data is None:
            self.fetch_api_data()

        brands = {
            0: {"static_file": "olis_static.json", "stations": [], "names": set()},
            1: {"static_file": "ob_static.json", "stations": [], "names": set()},
        }

        # Olis static data load
        olis_file = self.data_dir / brands[0]["static_file"]
        if olis_file.exists():
            with open(olis_file, "r", encoding="utf-8") as file:
                static_data = json.load(file)
                brands[0]["stations"] = static_data.get("stations", [])
                brands[0]["names"] = {
                    station["name"] for station in brands[0]["stations"]
                }

        # Ob static data load
        ob_file = self.data_dir / brands[1]["static_file"]
        if ob_file.exists():
            with open(ob_file, "r", encoding="utf-8") as file:
                static_data = json.load(file)
                brands[1]["stations"] = static_data.get("stations", [])
                brands[1]["names"] = {
                    station["name"] for station in brands[1]["stations"]
                }

        updated = {0: False, 1: False}

        # Proccess API stations
        for station in self.api_data["Items"]:
            try:
                type_station = station["Type"]  # 0 = Olis, 1 = Ob
                name = self.get_station_name(station)

                if name not in brands[type_station]["names"]:
                    new_station = self.build_new_station(station)
                    brands[type_station]["stations"].append(new_station)
                    brands[type_station]["names"].add(name)
                    updated[type_station] = True

            except Exception as e:
                self.logger.error(f"Error adding new station {name}: {e}")
                continue

        for type_station, data in brands.items():

            brand = "OB" if type_station == 1 else "Olis"
            if updated[type_station]:
                filepath = self.data_dir / data["static_file"]
                with open(filepath, "w", encoding="utf-8") as file:
                    json.dump(
                        {"stations": data["stations"]},
                        file,
                        ensure_ascii=False,
                        indent=2,
                    )
                self.logger.info(f"New station found for {brand}")
            else:
                self.logger.info(f"No new stations for {brand}")

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
            station_data = stations_aux.get(station["name"])

            if not station_data:
                self.logger.warning(f"No data for {station['name']}")
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
                    "colored_diesel_price": price_diesel_c,
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


if __name__ == "__main__":
    collector = OlisObCollector()
    collector.get_static_info()
    collector.update_prices()
