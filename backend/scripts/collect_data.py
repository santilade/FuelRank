from app.utils.constants import DATA_COLLECTORS
import logging

logger = logging.getLogger("All Collectors script")


def get_static_data():
    logger.info("scraping static info")
    for collector in DATA_COLLECTORS:
        collector.get_static_info()


def update_prices():
    logger.info("updating prices")
    for collector in DATA_COLLECTORS:
        collector.update_prices()


if __name__ == "__main__":
    get_static_data(),
    update_prices()
