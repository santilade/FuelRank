# FuelRank – Fuel Price Aggregator for Iceland

**FuelRank** is a backend-first project that collects and stores up-to-date fuel price data from various Icelandic fuel companies. It is designed to support a future public-facing web application with filtering and ranking capabilities.

## Data Collection

Data is gathered through public endpoints exposed by gas station websites. While technically this qualifies as scraping, it is performed ethically by targeting open and unprotected resources. In the case of **Orkan**, the company has generously granted access to their official API, which means no scraping is performed there. This setup is subject to future refactoring.

### Notes on Costco iceland
**Costco** operates a single gas station in Iceland under a membership-only model. It is often the cheapest option in the country, but unfortunately, **they do not publish fuel prices anywhere online.** So far, they have not responded to my requests for information. I am currently **exploring alternative ways to include their data** in the system in a reliable and manner.


## Static vs Dynamic Data

- **Static station metadata** (e.g., name, address, coordinates) is saved in `.json` files and manually reviewed before being imported into the database.  
  This is necessary because some stations do not provide full location data, and geolocation services are not always reliable (searching for options).
  
- **Dynamic data** (fuel prices, discounts) is inserted directly into the PostgreSQL database, but only if there is a change since the last recorded value.

## Tech Stack
### Backend
- **Language**: Python 3.11+
- **Framework**: Flask
- **ORM**: SQLAlchemy + Flask-SQLAlchemy
- **Database**: PostgreSQL
- **Linting**: flake8
### Frontend
- **Language**: React (TypeScript) – planned
### Deployment
- **Docker** (planned)

## Workflow

1. **Scraping Static Info** (Run manually or monthly):
    - Scrapers generate `.json` files with editable station metadata.
    - These files are manually reviewed and optionally corrected.
    - Then loaded into the database using `init_db.py` via utility functions.
2. **Price data** (Run frequently, via cron) 
    - Each scraper fetches updated fuel prices and discounts.
    - If the new price is different from the last saved price, it is inserted.
    - No duplicates are saved.
3. **Database Structure** (simplified) 
    - Station: id, name, address, location, company
    - Fuel: id, name
    - Price: id, station_id, fuel_id, price, datetime
    - Discount: id, station_id, value, description, datetime

## Roadmap

- [ ] Implement cron job for periodic price updates
- [ ] Create RESTful API endpoints
- [ ] Build a React-based frontend (filtering, map view, etc.)
- [ ] Improve static data accuracy (e.g. geocoding verification)
- [ ] Dockerize the project

## License
This project is currently under development and intended for academic and research purposes under a **MIT License**
