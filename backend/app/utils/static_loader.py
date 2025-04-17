from app.models.station import Station
from app.db import db
from datetime import datetime, timezone
import json


def load_static_data(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    stations = data.get("stations", [])
    count = 0

    for entry in stations:
        station = Station(
            id=entry.get("id"),
            name=entry.get("name"),
            brand=entry.get("brand"),
            address=entry.get("address"),
            lat=entry.get("latitude"),
            long=entry.get("longitude"),
            url=entry.get("url"),
            region=entry.get("region"),
            created_at=datetime.now(timezone.utc)
        )

        db.session.merge(station)
        count += 1

    db.session.commit()
    return count
