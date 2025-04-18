from app import create_app
from app.db import db
from app.models.fuel import Fuel
from app.utils.logger import get_logger

app = create_app()

logger = get_logger("seed_fuel")

FUEL_TYPES = {
    "GAS": "Gasoline",
    "DIESEL": "Diesel",
    "COLDIESEL": "Colored Diesel",
    "SHIPPING": "Shipping Fuel",
    "METAN": "Methane",
    "ELECTRIC": "Electricity",
}


def seed_fuel_table():
    with app.app_context():
        for fuel_id, name in FUEL_TYPES.items():
            if not db.session.get(Fuel, fuel_id):
                fuel = Fuel(id=fuel_id, name=name)
                db.session.add(fuel)
        db.session.commit()
        logger.info("Fuel table seeded")


if __name__ == "__main__":
    seed_fuel_table()
