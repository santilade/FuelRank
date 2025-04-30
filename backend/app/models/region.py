from app import db
from app.settings import SCHEMA_NAME


class Region(db.Model):
    __tablename__ = "regions"
    __table_args__ = {"schema": SCHEMA_NAME}

    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(40), nullable=False)

    stations = db.relationship("Station", back_populates="region")

    def __repr__(self):
        return f"<Region {self.name}>"

    def to_dict(self):
        return {"id": self.id, "name": self.name}
