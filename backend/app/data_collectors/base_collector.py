from app.settings import CONTACT
from abc import ABC, abstractmethod
from dotenv import load_dotenv
from pathlib import Path
from app.utils.logger import get_logger
import json
import hashlib
import requests


class BaseCollector(ABC):
    def __init__(self):
        load_dotenv()
        # Obtains module name per file:
        self.logger = get_logger(self.__class__.__name__)

        self.base_dir = Path(__file__).resolve().parents[2]
        self.data_dir = self.base_dir / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.contact_data = CONTACT

        self.api_data = None

    def fetch_api_data(self):

        method = self.get_HTTP_method().upper()

        if method == "GET":
            response = requests.get(self.endpoint_url)
        elif method == "POST":
            response = requests.post(self.endpoint_url)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        response.raise_for_status()
        self.api_data = response.json()

    def get_static_info(self):
        if self.api_data is None:
            self.fetch_api_data()

        static_file = self.data_dir / self.static_filename
        with open(static_file, "r", encoding="utf-8") as file:
            static_data = json.load(file)

        static_stations = static_data.get("stations", [])
        static_station_names = {station["name"] for station in static_stations}

        updated = False

        for station in self.api_data:
            try:
                name = self.get_station_name(station)
                if name not in static_station_names:
                    new_station = self.build_new_station(station)
                    self.logger.info(
                        f"New station {new_station['brand']} {new_station['name']} !"
                    )

                    static_stations.append(new_station)
                    static_station_names.add(name)
                    updated = True
            except Exception as e:
                self.logger.error(f"Error adding new station {name}: {e}")
                continue

        # Adding new station to the static json file
        if updated:
            with open(static_file, "w", encoding="utf-8") as file:
                json.dump(
                    {"stations": static_stations}, file, ensure_ascii=False, indent=2
                )
        else:
            self.logger.info("No new Stations")

    def get_location_data(self, search_data, id):
        try:
            params = {"q": search_data, "format": "json", "limit": 1}
            headers = {"User-Agent": f"FuelRank ({self.contact_data})"}

            response = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params=params,
                headers=headers,
            )
            response.raise_for_status()

            data = response.json()

            if data:
                open_maps_address = data.get("address", {})
                region = (
                    open_maps_address.get("state_district")
                    or open_maps_address.get("state")
                    or open_maps_address.get("county")
                )
                return float(data[0]["lon"]), float(data[0]["lat"]), region
            else:
                self.logger.warning(f"No location data found for station {id}")
                return None, None, None
        except Exception as e:
            self.logger.error(f"While fetching location data for {id} station: {e}")
            return None, None, None

    @abstractmethod
    def get_HTTP_method(self):
        """
        Each collector must to define wether the endpoint call is GET or POST
        """

    @abstractmethod
    def build_new_station(self, station):
        """
        each sub collector must build a new station for the static.json file
        depending on the format of the endpoint answer.
        """
        pass

    @abstractmethod
    def get_station_name(self, station):
        """Each sub collector must define how to obtain the 'name' of the station
        depending on the format of the endpoint answer
        """

    @abstractmethod
    def update_prices(self):
        pass

    def save_to_json(self, data, filename):
        filepath = self.data_dir / filename
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def update_json_static(self, data, filename):
        filepath = self.data_dir / filename

        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = {"stations": []}

        existing_stations = {s["name"] for s in existing_data["stations"]}

        for station in data.get("stations", []):
            if station["name"] not in existing_stations:
                existing_data["stations"].append(station)
                self.logger.info(f"New station '{station['name']}' added!")

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)

    def generate_station_id(self, brand, name, address):

        prefix = brand[:2].upper()
        components = [brand, name, address]
        base_raw = "-".join(filter(None, components))

        hash_bytes = hashlib.sha256(base_raw.encode()).digest()
        suffix = int.from_bytes(hash_bytes[:2], "big") % 10000

        return f"{prefix}{suffix:04d}"
