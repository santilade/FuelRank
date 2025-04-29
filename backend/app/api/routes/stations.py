from flask import Blueprint, request, Response
from app.models.station import Station
from app.models.region import Region
from app import db
import json

stations_bp = Blueprint("stations", __name__)


@stations_bp.route("/", methods=["GET"])
def get_stations():
    """
    /stations?region=cr
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
        limit = int(request.args.get("limit", 20))
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

    query = db.session.query(Station).join(Station.brand)

    if region_param:
        query = query.join(Station.region).filter(Region.id == region_param_upper)

    results = query.offset(offset).limit(limit).all()

    response = []
    for station in results:
        response.append(
            {
                "id": station.id,
                "name": station.name,
                "brand": station.brand.name,
                "address": station.address,
                "region": station.region.name,
            }
        )

    return Response(
        json.dumps(response, ensure_ascii=False), content_type="application/json"
    )


@stations_bp.route("/<station_id>", methods=["GET"])
def get_station_detail(station_id):
    """
    /stations/<id> → Get detailed info for a specific station including
    prices for GAS and DIESEL
    """
    station = (
        db.session.query(Station)
        .join(Station.brand)
        .join(Station.region)
        .filter(Station.id == station_id)
        .first()
    )

    if not station:
        return Response(
            json.dumps({"error": "Station not found"}),
            status=404,
            content_type="application/json",
        )

    prices = {}
    for price in station.prices:
        fuel_id = price.id_fuel.upper()
        if fuel_id in ["GAS", "DIESEL"]:
            prices[fuel_id] = {
                "price": float(price.price),
                "discount": (float(price.discount) if price.discount else None),
                "last_update": price.last_update.isoformat(),
            }

    response = {
        "id": station.id,
        "name": station.name,
        "brand": station.brand.name,
        "address": station.address,
        "lat": float(station.lat) if station.lat else None,
        "long": float(station.long) if station.long else None,
        "url": station.url,
        "region": station.region.name if station.region else None,
        "prices": prices,
    }

    return Response(
        json.dumps(response, ensure_ascii=False), content_type="application/json"
    )
