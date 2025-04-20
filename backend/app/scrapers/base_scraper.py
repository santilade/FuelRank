from abc import ABC, abstractmethod
from dotenv import load_dotenv
from pathlib import Path
from app.utils.logger import get_logger
import json
import hashlib


class BaseScraper(ABC):
    def __init__(self):
        load_dotenv()
        # Obtains module name per file:
        self.logger = get_logger(self.__class__.__name__)

        self.base_dir = Path(__file__).resolve().parents[2]
        self.data_dir = self.base_dir / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.assigned_ids = []

    @abstractmethod
    def get_static_info(self):
        pass

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
