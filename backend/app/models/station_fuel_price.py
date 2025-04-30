from app import db
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy import NUMERIC, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from app.settings import SCHEMA_NAME


class StationFuelPrice(db.Model):
    __tablename__ = "station_fuel_price"
    __table_args__ = {"schema": SCHEMA_NAME}

    last_update = db.Column(TIMESTAMP(timezone=True), nullable=False)
    id_station = db.Column(
        db.String, db.ForeignKey(f"{SCHEMA_NAME}.stations.id"), nullable=False
    )
    id_fuel = db.Column(
        db.String, db.ForeignKey(f"{SCHEMA_NAME}.fuel.id"), nullable=False
    )
    price = db.Column(NUMERIC(6, 2), nullable=False)
    discount = db.Column(NUMERIC(6, 2), nullable=True)

    constr_fields = ["id_station", "id_fuel"]

    __table_args__ = (
        PrimaryKeyConstraint(*constr_fields, name="station_fuel_price_PK"),
    )

    station = relationship("Station", backref="prices")
    fuel = relationship("Fuel", backref="prices")

    def to_dict(self):
        discount = float(self.discount) if self.discount is not None else None
        return {
            "last_update": self.last_update.isoformat(),
            "id_station": self.id_station,
            "id_fuel": self.id_fuel,
            "price": float(self.price),
            "discount": discount,
        }
