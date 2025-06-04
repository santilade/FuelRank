# FuelRank – Backend

## Project Structure
```
backend/
│
├── app/
│ ├── api/                     # Flask routes and endpoints
│ │ └── routes/ 
│ │ ├── brands.py 
│ │ ├── fuel.py
│ │ ├── prices.py 
│ │ └── stations.py 
│ │
│ ├── data_collectors/         # Collectors for each brand
│ │ ├── atlantsolia_collector.py
│ │ ├── base_collector.py      # Common scraper base class
│ │ ├── n1_collector.py
│ │ ├── olis_ob_collector.py   # Olís and OB merged logic
│ │ └── orkan_collector.py     # Uses Orkan's provided API
│ │
│ ├── models/                  # SQLAlchemy models
│ │ ├── brand.py
│ │ ├── fuel.py
│ │ ├── region.py
│ │ ├── station.py
│ │ └── station_fuel_price.py
│ │
│ └── utils/                   # General purpose utilities
│ ├── data_loaders/            # Loaders for static station data
│ ├── seeders/                 # Logic to initialize or update DB
│ │ ├── constants.py 
│ │ ├── logger.py 
│ │ ├── price_updater.py 
│ │ └── scheduler.py           # APScheduler integration
│ ├── db.py 
│ └── settings.py # Env var loading via dotenv
│
├── data/ # JSON dumps of scraped data
│
├── scripts/                   # Manual CLI scripts
│ ├── collect_data.py 
│ └── init_db.py 
│
├── .env 
├── .flake8 
├── README.md
├── requirements.txt 
└── run.py                     # Flask app entry point
```

## Tech Stack
### Backend
- **Language**: Python 3.11+
- **Framework**: Flask
- **ORM**: SQLAlchemy + Flask-SQLAlchemy
- **Database**: PostgreSQL
- **Linting**: flake8

## Data Collection

Data is gathered through public endpoints exposed by gas station websites. While technically this qualifies as scraping, it is performed ethically by targeting open and unprotected resources. In the case of **Orkan** and **Olís** (also owners of **ÓB**), the companies have generously granted access to their official endpoint, which means no "scraping" is performed there.

## Static vs Dynamic Data

- **Static station metadata** (e.g., name, address, coordinates) is saved in `.json` files and manually reviewed before being imported into the database.  
  This is necessary because some stations do not provide full location data, and geolocation services are not always reliable (searching for options).
  
- **Dynamic data** (fuel prices, discounts) is inserted directly into the PostgreSQL database, but only if there is a change since the last recorded value.
## Workflow

1. **Collect Static Info** (Run manually or monthly):
    - Data Collectors generate `.json` files with editable station metadata.
    - These files are manually reviewed and optionally corrected (not possible to get allways accurate location data).
    - Then loaded into the database using `init_db.py` via utility functions.
2. **Price data** (Run frequently, APScheduler) 
    - Each data collector fetches updated fuel prices and discounts.
    - If the new price is different from the last saved price, it is inserted.
    - No duplicates are saved.
3. **Database Structure** (simplified) 
    - Station: id, name, address, location, company
    - Fuel: id, name
    - Region: id and name
    - Price: id, station_id, fuel_id, price, datetime
    - Discount: id, station_id, value, description, datetime

## API – Documentation

This API provides access to fuel prices from gas stations in Iceland. It supports filtering, sorting, and pagination to help users find the best fuel prices.

## Endpoints

### `GET /prices`

Returns a list of fuel prices ordered from lowest to highest. Supports filtering by fuel type, region and pagination.

#### 🔍 Query Parameters

| Name       | Type     | Required | Description                                                                 |
|------------|----------|----------|-----------------------------------------------------------------------------|
| `fuel`     | string[] | No       | One or more fuel type IDs (e.g. `GAS`, `DIESEL`, `ELECTRIC`).              |
| `limit`    | int      | No       | Number of results to return. Default is `10`.                              |
| `offset`   | int      | No       | Number of results to skip (for pagination). Default is `0`.                |

Multiple `fuel` parameters can be passed like:  
> `/prices?fuel=GAS&fuel=DIESEL`

#### Example Requests

- `GET /prices`  
- `GET /prices?fuel=GAS`  
- `GET /prices?fuel=GAS&fuel=DIESEL&limit=5`  
- `GET /prices?limit=10&offset=10` ← page 2
- `GET /prices?region=cr`
- `GET /prices?region=sr&fuel=DIESEL` ← prices of diesel in Southern Region

#### Available Regions

To filter fuel prices by region, use the `region` query parameter with one of the following region IDs:

| ID  | Region Name              |
|-----|---------------------------|
| CR  | Capital Region             |
| SP  | Southern Peninsula         |
| WR  | Western Region             |
| WF  | Westfjords                 |
| NW  | Northwestern Region        |
| NE  | Northeastern Region        |
| ER  | Eastern Region             |
| SR  | Southern Region            |
| UR  | Unknown Region             |

**Example**:  
`GET /prices?region=CR` → returns prices for the Capital Region.

#### Sample Response

```json
[
  {
    "brand": "Atlantsolia",
    "address": "Bústaðavegur 151, 103 Reykjavík",
    "fuel_type": "Shipping Fuel",
    "price": 134.0,
    "discount": 110.6,
    "last_update": "2025-04-21T10:46:13.612003+00:00"
  }
]

```

### `GET /stations`

Returns a paginated list of gas stations. Optionally, stations can be filtered by region.

#### Query Parameters

| Name       | Type   | Required | Description                                    |
|------------|--------|----------|------------------------------------------------|
| `limit`    | int    | No       | Number of results to return (default `20`)     |
| `offset`   | int    | No       | Number of results to skip (default `0`)        |
| `region`   | string | No       | Filter stations by region ID (e.g., `CR`, `SR`) |

> **Note**:  
> Use the same region IDs as for /prices:

#### Example Requests

- `GET /stations`
- `GET /stations?region=CR`
- `GET /stations?limit=10&offset=20`

---

#### Sample Response

```json
[
  {
    "id": "IS001",
    "name": "Orkan Mjódd",
    "brand": "Orkan",
    "address": "Mjódd, 108 Reykjavík",
    "region": "Capital Region"
  },
  {
    "id": "IS002",
    "name": "N1 Reykjavik",
    "brand": "N1",
    "address": "Vesturlandsvegur, 104 Reykjavík",
    "region": "Capital Region"
  }
]
```
### `GET /stations/<id>`
Returns detailed information about a specific gas station, including basic station info and the latest fuel prices for GAS and DIESEL (if available).

#### URL Parameters
| Name       | Type   | Required | Description                                    |
|------------|--------|----------|------------------------------------------------|
| `id`       | string | yes      | Station ID to retrieve information             |

#### Example Request
- `GET /stations/N14082`

#### Sample Response
```json
[
  {
  "id": "N14082",
  "name": "Þjónustustöð - Húsavík",
  "brand": "N1",
  "address": "Héðinsbraut 2, 640 Húsavík",
  "lat": 66.047631,
  "long": -17.343509,
  "url": "https://n1.is/stodvar/thjonustustod-husavik/",
  "region": "Northeastern Region",
  "prices": {
    "GAS": {
      "price": 317.3,
      "discount": null,
      "last_update": "2025-04-29T07:34:40.799219+00:00"
    },
    "DIESEL": {
      "price": 323.2,
      "discount": null,
      "last_update": "2025-04-29T07:34:40.799219+00:00"
    }
  }
}
]
```
### `GET /brands`

Returns a list of all available fuel brands.

#### Example Request

- `GET /brands`

#### Sample Response

```json
[
  {
    "id": "ORK",
    "name": "Orkan"
  },
  {
    "id": "N1",
    "name": "N1"
  },
  {
    "id": "ATL",
    "name": "Atlantsolía"
  }
]
```

### `GET /fuels`

Returns a list of all available fuel types that the application tracks.

---

#### Example Request

- `GET /fuels`

---

#### Sample Response

```json
[
  {
    "id": "GAS",
    "name": "Gasoline"
  },
  {
    "id": "DIESEL",
    "name": "Diesel"
  },
  {
    "id": "COLORED_DIESEL",
    "name": "Colored Diesel"
  },
  {
    "id": "SHIPPING",
    "name": "Shipping Fuel"
  },
  {
    "id": "ELECTRIC",
    "name": "Electric Charging"
  }
]

```
---

#### Notes

- All responses are in **JSON** format.
- `price` and `discount` fields are decimals with **2 decimal places**.
- `last_update` and other date fields use **ISO 8601 format**:  
  `YYYY-MM-DDTHH:MM:SSZ` (e.g. `2025-04-21T10:46:13Z`)
