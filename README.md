# FuelRank – Fuel Price Aggregator for Iceland

**FuelRank** is a backend-first project that collects and stores up-to-date fuel price data from various Icelandic fuel companies. It is designed to support a future public-facing web application with filtering and ranking capabilities.

## Data Collection

Data is gathered through public endpoints exposed by gas station websites. While technically this qualifies as scraping, it is performed ethically by targeting open and unprotected resources. In the case of **Orkan**, the company has generously granted access to their official endpoint, which means no "scraping" is performed there.

### Notes on Costco iceland
**Costco** operates a single gas station in Iceland under a membership-only model. It is often the cheapest option in the country, but unfortunately, **they do not publish fuel prices anywhere online.** So far, they have not responded to my requests for information. I am currently **exploring alternative ways to include their data** in the system in a reliable manner.


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

1. **Collect Static Info** (Run manually or monthly):
    - Data Collectors generate `.json` files with editable station metadata.
    - These files are manually reviewed and optionally corrected (not possible to get allways accurate location data).
    - Then loaded into the database using `init_db.py` via utility functions.
2. **Price data** (Run frequently, via cron) 
    - Each data collector fetches updated fuel prices and discounts.
    - If the new price is different from the last saved price, it is inserted.
    - No duplicates are saved.
3. **Database Structure** (simplified) 
    - Station: id, name, address, location, company
    - Fuel: id, name
    - Price: id, station_id, fuel_id, price, datetime
    - Discount: id, station_id, value, description, datetime

## API – Documentation

This API provides access to fuel prices from gas stations in Iceland. It supports filtering, sorting, and pagination to help users find the best fuel prices.

## Endpoints

### `GET /prices/ranking`

Returns a list of fuel prices ordered from lowest to highest. Supports filtering by fuel type and pagination.

#### 🔍 Query Parameters

| Name       | Type     | Required | Description                                                                 |
|------------|----------|----------|-----------------------------------------------------------------------------|
| `fuel`     | string[] | No       | One or more fuel type IDs (e.g. `GAS`, `DIESEL`, `ELECTRIC`).              |
| `limit`    | int      | No       | Number of results to return. Default is `10`.                              |
| `offset`   | int      | No       | Number of results to skip (for pagination). Default is `0`.                |

Multiple `fuel` parameters can be passed like:  
> `/prices/ranking?fuel=GAS&fuel=DIESEL`

#### Example Requests

- `GET /prices/ranking`  
- `GET /prices/ranking?fuel=GAS`  
- `GET /prices/ranking?fuel=GAS&fuel=DIESEL&limit=5`  
- `GET /prices/ranking?limit=10&offset=10` ← page 2

#### Sample Response

```json
[
  {
    "brand": "Atlantsolia",
    "station_name": "Sprengisandur",
    "address": "Bústaðavegur 151, 103 Reykjavík",
    "fuel_type": "Shipping Fuel",
    "price": 134.0,
    "discount": 110.6,
    "last_update": "2025-04-21T10:46:13.612003+00:00"
  }
]
```
#### Upcoming endpoints (Planned)
| Endpoint            | Method | Description                    |
|---------------------|--------|--------------------------------|
| `/stations`         | GET    | List all stations              |
| `/stations/<id>`    | GET    | Get detailed station info      |
| `/brands`           | GET    | List available fuel brands     |
| `/fuels`            | GET    | List available fuel types      |

---

#### Notes

- All responses are in **JSON** format.
- `price` and `discount` fields are decimals with **2 decimal places**.
- `last_update` and other date fields use **ISO 8601 format**:  
  `YYYY-MM-DDTHH:MM:SSZ` (e.g. `2025-04-21T10:46:13Z`)

## Roadmap

- [ ] Create RESTful API endpoints
- [ ] Implement APScheduler for periodic price updates
- [ ] Build a React-based frontend (filtering, map view, etc.)
- [ ] Improve static data accuracy (e.g. geocoding verification)

## License
This project is currently under development and intended for academic and research purposes under a **MIT License**
