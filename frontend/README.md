# FuelRank - Frontend

## Project Structure
```
frontend/
├── public/
│   └── logos/                # PNG images of fuel brand logos (n1, orkan, olis, etc.)
├── src/
│   ├── api/                  # API request module
│   ├── assets/               # Static resources (fonts, decorative images)
│   ├── components/
│   │   ├── priceList/        # Fuel price listing page
│   │   │   ├── PriceListPage.tsx
│   │   │   └── service.ts
│   │   └── shared/
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       └── context.tsx   # Global context (theme and filter)
│   ├── App.tsx               # Main app entry
│   ├── index.tsx             # ReactDOM render
│   ├── theme/                # Light/Dark themes
│   │   ├── light.ts
│   │   ├── dark.ts
│   │   └── index.ts
├── .env.local
├── vite.config.ts
```


## Tech Stack
- **Language**: React (TypeScript)
- **React + TypeScript**
- **Vite** as bundler
- **Material UI v5** (`@mui/material`, `@mui/icons-material`)
- **Context API** for global state (`lightMode`, `fuelType`)
- **Styled Components** (MUI styled API)
---

## Dynamic Theme (Light/Dark)

- Two themes defined in `src/theme/light.ts` and `src/theme/dark.ts`
- Theme toggling via `IconButton` (`LightModeIcon`, `DarkModeIcon`)
- Theme controlled via `SharedContext`
---

## Fuel Type Filter

- Controlled globally from the `Header` using `ToggleButtonGroup`
- Values are `"gas"` and `"diesel"`
- Updates global `fuelType` context
- `PriceListPage` filters the stations based on selected value

---

## Global Context (`SharedContext`)

Located in `src/components/shared/context.tsx`

```ts
type SharedContextType = {{
  lightMode: boolean;
  setLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  fuelType: string | null;
  setFuelType: React.Dispatch<React.SetStateAction<string | null>>;
}};
```

Provided via `<SharedProvider>` and consumed with `useSharedContext()`.

---

## Key Components
### `<Header.tsx>`
- Displays the title and buttons to toggle theme and fuel type.
- Uses `ToggleButtonGroup`, `IconButton`, `AppBar`, `Toolbar`.
### `<Layout.tsx>`
- Defines the base layout.
- Wraps `Header` and applies responsive `Box` layout.
### `<PriceListPage.tsx>`
- Renders the fuel price list (`List`, `ListItem`, `Avatar`)
- Filters list by `fuelType` if set
- Accesses context data

## App.tsx
Renders:
```ts
<SharedProvider>
  <AppContent />  // Contains ThemeProvider, Layout and the page
</SharedProvider>
```
---

### Additional Notes
- Brand logos are stored in `public/logos/` and accessed via relative paths (/logos/n1.png)
- Data is fetched via `service.ts` (HTTP requests)
- Theme and fuel type state can be extended with `localStorage` for persistence