from app.data_collectors.atlantsolia_collector import AtlansoliaCollector
from app.data_collectors.n1_collector import N1Collector
from app.data_collectors.olis_ob_collector import OlisObCollector
from app.data_collectors.orkan_collector import OrkanCollector
import logging

DATA_COLLECTORS = [
    AtlansoliaCollector(),
    N1Collector(),
    OlisObCollector(),
    OrkanCollector(),
]

logger = logging.getLogger("allscraper")


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
