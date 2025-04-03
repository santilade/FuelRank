from abc import ABC, abstractmethod
import json

class BaseScraper(ABC):
    @abstractmethod
    def get_static_info(self):
        pass

    @abstractmethod
    def update_prices(self):
        pass

    @staticmethod
    def save_to_json(data, filename):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)