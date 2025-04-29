from flask import Blueprint, Response
from app.models.fuel import Fuel
from app import db
import json

fuel_bp = Blueprint("fuels", __name__)


@fuel_bp.route("/", methods=["GET"])
def get_fuels():
    """
    Get the list of available fuel types
    """
    query = db.session.query(Fuel).order_by(Fuel.name.asc())
    results = query.all()

    response = []

    for fuel in results:
        response.append({"id": fuel.id, "name": fuel.name})

    return Response(
        json.dumps(response, ensure_ascii=False), content_type="application/json"
    )
