from app import db
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy import Numeric


class Station(db.Model):
    __tablename__ = "stations"

    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    lat = db.Column(Numeric(9, 6), nullable=True)
    long = db.Column(Numeric(9, 6), nullable=True)
    url = db.Column(db.String(255), nullable=True)
    region = db.Column(db.String(50), nullable=True)
    created_at = db.Column(TIMESTAMP(timezone=True), nullable=False)

    def __repr__(self):
        return f"<Station {self.name} ({self.brand})"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "brand": self.brand,
            "address": self.address,
            "lat": float(self.lat) if self.lat else None,
            "long": float(self.long) if self.long else None,
            "url": self.url,
            'region': self.region,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }
