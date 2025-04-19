from app.models.station import Station
from app.models.brands import Brands
from app.db import db
from datetime import datetime, timezone
from app.utils.logger import get_logger
import json


BRAND_NAME_TO_ID = {
    "atlantsolia": "AT",
    "n1": "N1",
    "ob": "OB",
    "olis": "OL",
    "orkan": "OR",
}

logger = logger = get_logger("static_loader")


def load_static_data(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    stations = data.get("stations", [])
    count = 0

    for entry in stations:
        raw_brand = entry.get("brand", "").lower()
        brand_id = BRAND_NAME_TO_ID.get(raw_brand)

        if not brand_id:
            logger.error(
                f"Unknown brand '{raw_brand}' in station {entry.get('id')}. Skipping"
            )
            continue

        brand = db.session.get(Brands, brand_id)
        if not brand:
            logger.error(f"Brand {brand_id} not found in table brands. Skipping")
            continue

        station = Station(
            id=entry.get("id"),
            name=entry.get("name"),
            id_brand=brand_id,
            address=entry.get("address"),
            lat=entry.get("latitude"),
            long=entry.get("longitude"),
            url=entry.get("url"),
            region=entry.get("region"),
            created_at=datetime.now(timezone.utc),
        )

        db.session.merge(station)
        count += 1

    db.session.commit()
    return count
