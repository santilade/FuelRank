from app import db


class Fuel(db.Model):
    __tablename__ = "fuel"

    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(30), nullable=False)

    def __repr__(self):
        return f"<Fuel {self.name})"

    def to_dict(self):
        return {"id": self.id, "name": self.name}
