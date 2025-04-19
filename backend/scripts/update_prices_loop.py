from app import create_app
from app.scrapers.atlantsolia_scraper import AtlansoliaScraper
from app.scrapers.n1_scraper import N1Scraper
from app.scrapers.olis_ob_scraper import OlisObScraper
from app.scrapers.orkan_scraper import OrkanScraper
from app.utils.price_loader import load_prices_data
from app.utils.logger import get_logger
from pathlib import Path
from app import models
import time

# TODO: take out to constants file?

PRICES_FILES = [
    "atlantsolia_stations_prices.json",
    "n1_stations_prices.json",
    "ob_stations_prices.json",
    "olis_stations_prices.json",
    "orkan_stations_prices.json",
]

SCRAPERS = [
    AtlansoliaScraper(),
    N1Scraper(),
    OlisObScraper(),
    OrkanScraper(),
]

logger = get_logger("update_loop")
app = create_app()


def update():
    _ = models  # to satisfy flake8
    try:
        for scraper in SCRAPERS:
            scraper.update_prices()

        for file in PRICES_FILES:
            path = Path(__file__).resolve().parents[1] / "data" / f"{file}"
            inserted, skiped = load_prices_data(path)
            brand_name = file.split("_")[0]
            logger.info(
                f"{inserted} prices from {brand_name} updated, {skiped} unchanged"
            )
    except Exception as e:
        logger.error(f"Error updating prices {e}")


if __name__ == "__main__":
    with app.app_context():
        # TODO: once flask is running change update loop to APScheduler
        while True:
            update()
            time.sleep(300)
