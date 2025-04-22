from app.api.routes.prices import prices_bp


def register_routes(app):
    app.register_blueprint(prices_bp, url_prefix="/prices")
