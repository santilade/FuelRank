from app import create_app
from app.db import db
from pathlib import Path
from app.utils.static_loader import load_static_data
from app.utils.fuel_table_seeder import seed_fuel_table
from app.utils.logger import get_logger


STATIC_FILES = [
    "atlantsolia_static.json",
    "n1_static.json",
    "ob_static.json",
    "olis_static.json",
    "orkan_static.json",
]

PRICES_FILES = [
    "atlantsolia_stations_prices.json",
    "n1_stations_prices.json",
    "ob_stations_prices.json",
    "olis_stations_prices.json",
    "orkan_stations_prices.json",
]

logger = get_logger("init_db")

app = create_app()


def create_db():
    try:
        logger.info("🛠️ Initializing DB")
        from app import models

        _ = models  # to satisfy flake8
        db.create_all()
        logger.info("DB Initialized")

    except Exception as e:
        logger.error(f"Error initializing the database: {e}")


def load_static_files():
    try:
        for file in STATIC_FILES:
            path = Path(__file__).resolve().parents[1] / "data" / f"{file}"
            count = load_static_data(path)
            logger.info(f"Loaded {count} stations {file}")

    except Exception as e:
        logger.error(f"Error loading static data: {e}")


def seed_fuel_ids():
    try:
        count = seed_fuel_table()
        logger.info(f"{count} Fuel IDs seeded in fuel table")

    except Exception as e:
        logger.error(f"Error seeding Fuel Table: {e}")


def initialize_db():
    with app.app_context():
        create_db()
        load_static_files()
        seed_fuel_ids()


if __name__ == "__main__":
    initialize_db()
