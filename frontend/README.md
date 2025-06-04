# FuelRank - Frontend

## Project Structure

```
frontend/
├── public/
│   └── logos/                # PNG images of fuel brand logos (n1, orkan, olis, etc.)
├── src/
│   ├── api/                  # API client, services, and error handler
│   │   ├── client.ts
│   │   ├── services/
│   │   │   ├── pricesService.ts
│   │   │   └── stationDetailService.ts
│   │   └── utils/
│   │       └── handleApiError.ts
│   ├── assets/               # Static assets like SVG logos
│   ├── components/
│   │   ├── Layout/           # App shell: Header, Footer, Layout
│   │   ├── PriceListPage/    # Price list, map, and detail dialog
│   │   └── NotFoundPage/     # 404 fallback
│   ├── context/              # Global shared state with React Context
│   ├── theme/                # Light and dark MUI theme definitions
│   ├── types/                # TypeScript shared types
│   ├── utils/                # Utility functions (distance, formatting, name cleanup)
│   ├── App.tsx               # Main app component with routing and theming
│   ├── main.tsx              # React DOM bootstrap
│   └── index.css             # Global styles
├── .env.local                # API base URL configuration
├── vite.config.ts            # Vite configuration

```

## Tech Stack

- **Language**: TypeScript
- **React + TypeScript**
- **Vite** as bundler
- **Material UI v5** (`@mui/material`, `@mui/icons-material`)
- **Context API** for global state
- **Axios** for HTTP requests
- **Leaflet** (`react-leaflet`) for map rendering

## Dynamic Theme (Light/Dark)

- Light and Dark modes defined in:
  - `theme/light.ts`
  - `theme/dark.ts`
- Applied via `ThemeProvider` in `AppContent`
- Toggled in `Header` using `LightModeIcon` / `DarkModeIcon`
- Persisted in `localStorage`
- Controlled globally through `SharedContext`

## Routing

Defined in `App.tsx` using `react-router-dom`:

- `/`: Home - fuel price list
- `*`: Fallback - NotFoundPage

## Global State (SharedContext)

Located at `context/context.tsx` and used app-wide via `useSharedContext()`.

Managed states include:

- `lightMode`: boolean for theme
- `fuelType`: `'gasoline' | 'diesel' | null`
- `region`: selected region code or `null`
- `closest`: boolean (sort mode)
- `userCoords`: user's geolocation
- `dialogOpen`: detail dialog visibility
- `pricesLoading`: loading indicator
- `isMobile`: auto-detected via screen size

## Fuel Sorting Modes

Controlled from `Header`:

- Fuel Type Toggle (`ToggleButtonGroup`)
  - Values: `gasoline`, `diesel`
- Sorting Toggle:
  - `Closest`: sort by user distance
  - `Cheapest`: sort by price
- Region Filter: dropdown `Select`
  - Filters stations server-side by region param

## Geolocation & Map

- User’s position is requested via Geolocation API and coordinates saved in global context
- Distance is calculated using Haversine formula (utils/geo.ts)
- StationMap:
  - Uses Leaflet, highlights both user and station markers and auto-zooms to fit both
- Distance formatting: utils/format.ts

## Key Components

### `<Layout.tsx>`

Shell layout including `Header`, `children`, `Footer`

#### `<Header.tsx>`

- Displays logo and title
- Handles theme toggle, fuel type selection, sorting mode (price vs. distance), and region filtering
- Mobile layout uses `Select` elements instead of `ToggleButtonGroup`

#### `<Footer.tsx>`

- Email, GitHub, LinkedIn links

---

### `<PriceListPage.tsx>`

- Fetches and filters fuel prices
- Sorts results based on mode
- Renders list of `Paper` items with station name, price, distance, and fuel type
- On mobile opens `StationDetailDialog` on click

#### `<StationDetailDialog.tsx>`

- Optimized for mobile modal display
- Fetches detailed station data
- Shows address, Google Maps link, map, and fuel prices

#### `<StationMap.tsx>`

- Displays interactive Leaflet map with user + station markers
- Loads station info inside map popup (only in desktop)
- Styled using Material UI and responsive layout

---

### `<NotFoundPage.tsx>`

Friendly 404 page with a “Back to Home” button

---

## API Integration

All requests go through Axios `client.ts`:

- Base URL set via `.env.local` → `VITE_API_BASE_URL`
- Global response interceptor returns `.data`

### Endpoints:

`GET /prices?fuel=GAS&fuel=DIESEL[&region=...]`
→ Used in `pricesService.ts`

`GET /stations/:id`
→ Used in `stationDetailService.ts`

### Error Handling:

Centralized in `utils/handleApiError.ts`, provides user-friendly errors for HTTP/Network issues

## Deployment Note

Vite uses `import.meta.env` for environment variables, add `VITE_API_BASE_URL` in `.env.local`.

### Additional Notes

- Brand logos are stored in `public/logos/` and accessed via relative paths (/logos/n1.png)
- Project is fully typed with TypeScript
- Utility functions are abstracted and reusable
- Responsive support is automatic using useMediaQuery
- Theme preferences persist via localStorage
- Folder structure encourages modularity and separation of concerns
