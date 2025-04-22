from app.api.routes import register_routes


def init_api(app):
    register_routes(app)
