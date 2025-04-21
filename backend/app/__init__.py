from flask import Flask
from .db import db
from dotenv import load_dotenv
from app.api import init_api
import os


def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DB_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    init_api(app)

    return app
