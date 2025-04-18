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


def load_prices_data(file_path: Path) -> tuple[int, int]:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    update_date = datetime.fromisoformat(data.get("timestamp"))
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
                update_date=update_date, id_station=station_id, id_fuel=fuel_id
            ).first()

            if existing:
                """
                # TODO: normalize before comparing, sometimes detects
                diferents prices due to diferences in precision
                (in DB 288.8 being compared against an 288.80000001)
                """
                if (
                    float(existing.price) == float(price)
                    and existing.discount == discount
                ):
                    skipped += 1
                    continue

            new_price = StationFuelPrice(
                update_date=update_date,
                id_station=station_id,
                id_fuel=fuel_id,
                price=price,
                discount=discount,
            )
            db.session.merge(new_price)
            inserted += 1

    db.session.commit()
    return inserted, skipped
