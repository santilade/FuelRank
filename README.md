# FuelRank – Fuel Price Aggregator for Iceland

**FuelRank** is a backend-first project that collects and stores up-to-date fuel price data from various Icelandic fuel companies. It is designed to support a future public-facing web application with filtering and ranking capabilities.

### Notes on Costco iceland
**Costco** operates a single gas station in Iceland under a membership-only model. It is often the cheapest option in the country, but unfortunately, **they do not publish fuel prices anywhere online.** So far, they have not responded to my requests for information. I am currently **exploring alternative ways to include their data** in the system in a reliable manner.

## Backend and Frontend detailed documentation

## Tech Stack
### Backend
- **Language**: Python 3.11+
- **Framework**: Flask
- **ORM**: SQLAlchemy + Flask-SQLAlchemy
- **Database**: PostgreSQL
- **Linting**: flake8
### Frontend
- **Language**: React (TypeScript)
- **React + TypeScript**
- **Vite** as bundler
- **Material UI v5** (`@mui/material`, `@mui/icons-material`)
- **Context API** for global state (`lightMode`, `fuelType`)
- **Styled Components** (MUI styled API)
### Deployment
- **Docker** (planned)

## Roadmap

- [ ] Build a React-based frontend (filtering, map view, etc.)
- [ ] Improve static data accuracy (e.g. geocoding verification)

## License
This project is currently under development and intended for academic and research purposes under a **MIT License**
