from app import db


class Brands(db.Model):
    __tablename__ = "brands"

    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(20), nullable=False)

    stations = db.relationship("Station", back_populates="brand")

    def __repr__(self):
        return f"<Brand {self.name})"

    def to_dict(self):
        return {"id": self.id, "name": self.name}
