from apscheduler.schedulers.background import BackgroundScheduler
from flask import current_app
from app.utils.price_updater import update_prices
from scripts.collect_data import get_static_data

price_update_minutes = 5
static_update_weeks = 4


def start_scheduler(app):
    scheduler = BackgroundScheduler()
    # price update:
    scheduler.add_job(
        func=lambda: run_price_update(app),
        trigger="interval",
        minutes=price_update_minutes,
        id="price_update_job",
        replace_existing=True,
    )

    # static update
    scheduler.add_job(
        func=lambda: run_static_updater(app),
        trigger="interval",
        weeks=static_update_weeks,
        id="static_update_job",
        replace_existing=True,
    )

    scheduler.start()


def run_price_update(app):
    with app.app_context():
        try:
            update_prices()
            current_app.logger.info(
                f"Price update completed, next in {price_update_minutes} minutes"
            )
        except Exception as e:
            current_app.logger.error(f"Prices update failed: {e}")


def run_static_updater(app):
    with app.app_context():
        try:
            get_static_data()
            current_app.logger.info(
                f"Static update completed, next in {static_update_weeks} weeks"
            )
        except Exception as e:
            current_app.logger.error(f"Static update failed: {e}")
