from flask import Blueprint, request, Response
from app.models.station_fuel_price import StationFuelPrice
from app.models.fuel import Fuel
from app.models.station import Station
from app.models.region import Region
from app import db
import json

prices_bp = Blueprint("prices", __name__)


@prices_bp.route("/", methods=["GET"])
def get_prices():
    """
    /prices (general prices ranking)
    /prices?fuel=gas (diesel, colored_diesel,shipping, for ranking by fuel type)
    /prices?limit=10&offset=10 (pagination)
    /prices?region=cr
    cr = capital region
    sp = southern peninsula
    wr = western region
    wf = westerfjords
    nw = northwestern region
    ne = northeastern region
    er = eastern region
    sr = southern region
    """

    # limit param validation
    try:
        limit = int(request.args.get("limit", 10))
        if limit <= 0:
            raise ValueError
    except ValueError:
        return Response(
            json.dumps({"error": 'Invalid "limit" parameter'}),
            status=400,
            content_type="application/json",
        )

    # offset validation
    try:
        offset = int(request.args.get("offset", 0))
        if offset < 0:
            raise ValueError
    except ValueError:
        return Response(
            json.dumps({"error": "Invalid offset parameter"}),
            status=400,
            content_type="application/json",
        )

    # fuel param validation
    fuel_params = request.args.getlist("fuel")
    valid_fuel_ids = [fuel.id for fuel in db.session.query(Fuel.id).all()]

    if fuel_params:
        fuel_params_upper = [f.upper() for f in fuel_params]
        for fuel_id in fuel_params_upper:
            if fuel_id not in valid_fuel_ids:
                return Response(
                    json.dumps({"error": f"Invalid fuel type:{fuel_id}"}),
                    status=400,
                    content_type="application/json",
                )

    # Region param validation
    region_param = request.args.get("region")
    valid_region_ids = [region.id for region in db.session.query(Region.id).all()]

    if region_param:
        region_param_upper = region_param.upper()
        if region_param_upper not in valid_region_ids:
            return Response(
                json.dumps({"error": f"Invalid region id:{region_param_upper}"}),
                status=400,
                content_type="application/json",
            )

    query = (
        db.session.query(StationFuelPrice)
        .join(StationFuelPrice.fuel)
        .join(StationFuelPrice.station)
        .join(Station.brand)
    )

    if fuel_params:
        query = query.filter(Fuel.id.in_(fuel_params_upper))

    if region_param:
        query = query.join(Station.region).filter(Region.id == region_param_upper)

    results = (
        query.order_by(StationFuelPrice.price.asc()).offset(offset).limit(limit).all()
    )

    response = []
    for p in results:
        response.append(
            {
                "station_id": p.station.id,
                "station_name": p.station.name,
                "brand": p.station.brand.name,
                "address": p.station.address,
                "fuel_type": p.fuel.name,
                "price": float(p.price),
                "discount": float(p.discount) if p.discount else None,
                "last_update": p.last_update.isoformat(),
            }
        )

    return Response(
        json.dumps(response, ensure_ascii=False), content_type="application/json"
    )
