from app.data_collectors.atlantsolia_collector import AtlansoliaCollector
from app.data_collectors.n1_collector import N1Collector
from app.data_collectors.olis_ob_collector import OlisObCollector
from app.data_collectors.orkan_collector import OrkanCollector

DATA_COLLECTORS = [
    AtlansoliaCollector(),
    N1Collector(),
    OlisObCollector(),
    OrkanCollector(),
]

FUEL_MAPPING = {
    "gas_price": "GAS",
    "diesel_price": "DIESEL",
    "colored_diesel_price": "COLORED_DIESEL",
    "shipping_fuel_price": "SHIPPING",
}

DISCOUNT_MAPPING = {
    "gas_price": "gas_discount",
    "diesel_price": "diesel_discount",
    "colored_diesel_price": "colored_diesel_discount",
    "shipping_fuel_price": "shipping_fuel_discount",
}

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

BRANDS = {
    "AT": "Atlantsolia",
    "N1": "N1",
    "OB": "Ob",
    "OL": "Olis",
    "OR": "Orkan",
}

REGIONS = {
    "CR": "Capital Region",
    "SP": "Southern Peninsula",
    "WR": "Western Region",
    "WF": "Westfjords",
    "NW": "Northwestern Region",
    "NE": "Northeastern Region",
    "ER": "Eastern Region",
    "SR": "Southern Region",
    "UR": "Unkown Region",
}
