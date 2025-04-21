from flask import Blueprint, jsonify, request
from app.models.station_fuel_price import StationFuelPrice
from app.models.fuel import Fuel
from app.models.station import Station
from app import db

prices_bp = Blueprint("prices", __name__)


@prices_bp.route("ranking", methods=["GET"])
def get_price_ranking():
    fuel_params = request.args.getlist("fuel")
    limit = int(request.args.get("limit", 100))

    query = (
        db.session.query(StationFuelPrice)
        .join(StationFuelPrice.fuel)
        .join(StationFuelPrice.station)
        .join(Station.brand)
    )

    if fuel_params:
        fuel_params = [f.upper() for f in fuel_params]
        query = query.filter(Fuel.id.in_(fuel_params))

    results = query.order_by(StationFuelPrice.price.asc()).limit(limit).all()

    response = []
    for p in results:
        response.append(
            {
                "station_id": p.id_station,
                "station_name": p.station.name,
                "brand": p.station.brand.name,
                "fuel_type": p.fuel.name,
                "price": float(p.price),
                "discount": float(p.discount) if p.discount is not None else None,
                "last_update": p.last_update.isoformat(),
            }
        )

    return jsonify(response)
