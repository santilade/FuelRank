from abc import ABC, abstractmethod
import json
import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

class BaseScraper(ABC):
    def __init__(self):
        # Obtains module name per file:
        self.logger = logging.getLogger(self.__class__.__name__)
    
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