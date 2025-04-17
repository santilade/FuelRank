from app import create_app
from app.db import db
from pathlib import Path
from app.utils.static_loader import load_static_data
import logging


STATIC_FILES = [
    "atlantsolia_static.json",
    "n1_static.json",
    "ob_static.json",
    "olis_static.json",
    "orkan_static.json",
]

# TODO: send logging basic config out
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("init_db")

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


def initialize_db():
    with app.app_context():
        create_db()
        load_static_files()


if __name__ == "__main__":
    initialize_db()
