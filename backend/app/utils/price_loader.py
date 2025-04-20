from app.db import db
from app.models.station_fuel_price import StationFuelPrice
from datetime import datetime
import json
from pathlib import Path

# TODO: validate if Fuel_id exists in Fuel table
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


def is_equal(a, b, tol=0.01):
    """
    to avoid diferences in precision, for ex: comparing 288.8 against 288.80000001
    """
    if a is None and b is None:
        return True
    if a is None or b is None:
        return False
    return abs(float(a) - float(b)) < tol


def load_prices_data(file_path: Path) -> tuple[int, int]:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    last_scrap_update = datetime.fromisoformat(data.get("timestamp"))
    stations = data.get("stations", [])
    inserted = 0
    skipped = 0

    for station in stations:
        station_id = station.get("id")

        for price_key, fuel_id in FUEL_MAPPING.items():
            price = station.get(price_key)
            discount = station.get(DISCOUNT_MAPPING[price_key])

            if price is None:
                continue

            existing = StationFuelPrice.query.filter_by(
                id_station=station_id, id_fuel=fuel_id
            ).first()

            if existing:
                if is_equal(existing.price, price) and is_equal(
                    existing.discount, discount
                ):
                    existing.last_update = last_scrap_update
                    db.session.commit()
                    skipped += 1
                    continue

            new_price = StationFuelPrice(
                last_update=last_scrap_update,
                id_station=station_id,
                id_fuel=fuel_id,
                price=price,
                discount=discount,
            )
            db.session.merge(new_price)
            inserted += 1

    db.session.commit()
    return inserted, skipped
