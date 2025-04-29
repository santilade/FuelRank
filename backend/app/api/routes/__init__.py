from app.api.routes.prices import prices_bp
from app.api.routes.stations import stations_bp
from app.api.routes.brands import brands_bp
from app.api.routes.fuel import fuel_bp


def register_routes(app):
    app.register_blueprint(prices_bp, url_prefix="/prices")
    app.register_blueprint(stations_bp, url_prefix="/stations")
    app.register_blueprint(brands_bp, url_prefix="/brands")
    app.register_blueprint(fuel_bp, url_prefix="/fuel")
