from app import create_app
from app.db import db
from pathlib import Path
from app.utils.static_loader import load_static_data
from app.utils.fuel_table_seeder import seed_fuel_table
from app.utils.brands_table_seeder import seed_brands_table
from app.utils.regions_table_seeder import seed_regions_table
from app.utils.price_loader import load_prices_data
from app.utils.logger import get_logger
from app.utils.constants import STATIC_FILES, PRICES_FILES

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
            brand_name = file.split("_")[0]
            logger.info(f"Loaded {count} {brand_name} stations")

    except Exception as e:
        logger.error(f"Error loading static data: {e}")


def seed_fuels():
    try:
        count = seed_fuel_table()
        logger.info(f"{count} Fuel IDs seeded in fuel table")

    except Exception as e:
        logger.error(f"Error seeding Fuel Table: {e}")


def seed_brands():
    try:
        count = seed_brands_table()
        logger.info(f"{count} Brands IDs seeded in Brands table")
    except Exception as e:
        logger.error(f"Error seeding Brands table: {e}")


def load_prices():
    try:
        for file in PRICES_FILES:
            path = Path(__file__).resolve().parents[1] / "data" / f"{file}"
            inserted, skipped = load_prices_data(path)
            brand_name = file.split("_")[0]
            logger.info(
                f"{inserted} prices inserted for {brand_name}, unchanged: {skipped}"
            )
    except Exception as e:
        logger.error(f"Error loading prices: {e}")


def seed_regions():
    try:
        count = seed_regions_table()
        logger.info(f"{count} Regions IDs seeded in Regions table")
    except Exception as e:
        logger.error(f"Error seeding Regions table: {e}")


def initialize_db():
    with app.app_context():
        create_db()
        seed_brands()
        seed_fuels()
        seed_regions()
        load_static_files()
        load_prices()


if __name__ == "__main__":
    initialize_db()
