from app.settings import POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, HOSTNAME_DB
from flask import Flask
from .db import db
from app.api import init_api
from app.utils.scheduler import start_scheduler

db_url = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{HOSTNAME_DB}:5432/{POSTGRES_DB}"
)


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    init_api(app)

    start_scheduler(app)

    return app
