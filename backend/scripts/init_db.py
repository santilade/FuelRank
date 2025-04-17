from app import create_app
from app.db import db
import logging

# TODO: send logging basic config out
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger('init_db')

app = create_app()


def initialize_db():
    logger.info("🛠️ Initializing DB")

    try:
        with app.app_context():
            from app import models
            _ = models  # to satisfy flake8
            db.create_all()
            logger.info('DB Initialized')

    except Exception as e:
        logger.error(f"Error initializing the database: {e}")


if __name__ == "__main__":
    initialize_db()
