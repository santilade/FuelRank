from app.utils.constants import DATA_COLLECTORS
from app.utils.constants import PRICES_FILES
from app.utils.data_loaders.price_loader import load_prices_data
from app.utils.logger import get_logger
from pathlib import Path
from app import models


logger = get_logger("update_loop")


def update_prices():
    _ = models  # to satisfy flake8
    try:
        for collector in DATA_COLLECTORS:
            collector.update_prices()

        for file in PRICES_FILES:
            path = Path(__file__).resolve().parents[2] / "data" / f"{file}"
            inserted, skiped = load_prices_data(path)
            brand_name = file.split("_")[0]
            logger.info(
                f"{inserted} prices from {brand_name} updated, {skiped} unchanged"
            )
    except Exception as e:
        logger.error(f"Error updating prices {e}")
