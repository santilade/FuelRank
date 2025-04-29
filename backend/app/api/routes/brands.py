from flask import Blueprint, Response
from app.models.brand import Brand
from app import db
import json

brands_bp = Blueprint("brands", __name__)


@brands_bp.route("/", methods=["GET"])
def get_brands():
    """
    Returns a list of all available fuel brands.
    """
    query = db.session.query(Brand).order_by(Brand.name.asc())
    results = query.all()

    response = []

    for brand in results:
        response.append({"id": brand.id, "name": brand.name})

    return Response(
        json.dumps(response, ensure_ascii=False), content_type="application/json"
    )
