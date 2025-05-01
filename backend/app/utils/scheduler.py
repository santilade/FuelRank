from apscheduler.schedulers.background import BackgroundScheduler
from flask import current_app
from app.utils.price_updater import update


def start_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=lambda: run_update(app),
        trigger="interval",
        minutes=5,
        id="price_update_job",
        replace_existing=True,
    )
    scheduler.start()


def run_update(app):
    with app.app_context():
        try:
            update()
            current_app.logger.info("Update completed successfully.")
        except Exception as e:
            current_app.logger.error(f"Update failed: {e}")
