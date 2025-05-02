from app.db import db
from app.models.fuel import Fuel

FUEL_TYPES = {
    "GAS": "Gasoline",
    "DIESEL": "Diesel",
    "COLORED_DIESEL": "Colored Diesel",
    "SHIPPING": "Shipping Fuel",
    "METAN": "Methane",
    "ELECTRIC": "Electricity",
}


def seed_fuel_table():
    fuel_id_count = 0
    for fuel_id, name in FUEL_TYPES.items():
        if not db.session.get(Fuel, fuel_id):
            fuel = Fuel(id=fuel_id, name=name)
            db.session.add(fuel)
            fuel_id_count += 1
    db.session.commit()
    return fuel_id_count
