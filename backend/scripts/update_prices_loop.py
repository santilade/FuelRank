from app import create_app
from scripts.collect_data import DATA_COLLECTORS
from app.utils.price_loader import load_prices_data
from app.utils.logger import get_logger
from app.utils.constants import PRICES_FILES
from pathlib import Path
from app import models
import time


logger = get_logger("update_loop")
app = create_app()


def update():
    _ = models  # to satisfy flake8
    try:
        for collector in DATA_COLLECTORS:
            collector.update_prices()

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
            logger.info("Waiting 5 minutes until next update...")
            time.sleep(300)
