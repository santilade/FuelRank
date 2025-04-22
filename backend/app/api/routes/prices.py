from flask import Blueprint, request, Response
from app.models.station_fuel_price import StationFuelPrice
from app.models.fuel import Fuel
from app.models.station import Station
from app import db
import json

prices_bp = Blueprint("prices", __name__)


@prices_bp.route("ranking", methods=["GET"])
def get_price_ranking():
    """
    /prices/ranking (general ranking)
    /prices/ranking&fuel=gas (diesel, colored_diesel,shipping, for ranking by fuel type)
    /prices/ranking&limit=10&offset=10 (pagination)
    """
    fuel_params = request.args.getlist("fuel")
    limit = int(request.args.get("limit", 10))
    offset = int(request.args.get("offset", 0))

    query = (
        db.session.query(StationFuelPrice)
        .join(StationFuelPrice.fuel)
        .join(StationFuelPrice.station)
        .join(Station.brand)
    )

    if fuel_params:
        fuel_params = [f.upper() for f in fuel_params]
        query = query.filter(Fuel.id.in_(fuel_params))

    results = (
        query.order_by(StationFuelPrice.price.asc()).offset(offset).limit(limit).all()
    )

    response = []
    for p in results:
        response.append(
            {
                "brand": p.station.brand.name,
                "station_name": p.station.name,
                "address": p.station.address,
                "fuel_type": p.fuel.name,
                "price": float(p.price),
                "discount": float(p.discount) if p.discount is not None else None,
                "last_update": p.last_update.isoformat(),
            }
        )

    return Response(
        json.dumps(response, ensure_ascii=False), content_type="application/json"
    )
