import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import React, { useState } from 'react';
import { useSharedContext } from '../../context/context';
import {
  Alert,
  AppBar,
  styled,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Toolbar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  type SelectChangeEvent,
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { HeaderProps } from '../../types/types';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: 0,
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledToolBar = styled(Toolbar)(({ theme }) => ({
  position: 'relative',

  justifyContent: 'space-between',
  minHeight: 56,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    minHeight: 64,
  },
}));

const Header = ({ title }: HeaderProps) => {
  const {
    lightMode,
    setLightMode,
    fuelType,
    setFuelType,
    closest,
    setClosest,
    isMobile,
    region,
    setRegion,
    pricesLoading,
    userCoords,
  } = useSharedContext();
  const [showCoordsAlert, setShowCoordsAlert] = useState(false);

  const toggleTheme = () => setLightMode((prev: boolean) => !prev);

  const fuelHandleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    setFuelType(newValue);
  };

  const closestHandleChange = (_event: React.MouseEvent<HTMLElement>, newValue: boolean) => {
    if (newValue === true && !userCoords) {
      setShowCoordsAlert(true);
      return;
    }
    if (newValue !== null) {
      setClosest(newValue);
    }
  };

  const regionHandleChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    setRegion(value === 'None' ? null : value);
  };

  const RegionSelector = ({
    region,
    onChange,
  }: {
    region: string | null;
    onChange: (e: SelectChangeEvent) => void;
    sx?: object;
  }) => (
    <FormControl
      size="small"
      sx={{
        ...(isMobile ? { flex: 1 } : { width: '150px' }),
      }}
    >
      <InputLabel>Region</InputLabel>
      <Select value={region ?? 'None'} onChange={onChange} label="Region" disabled={pricesLoading}>
        <MenuItem value="None">
          <em>None</em>
        </MenuItem>
        <MenuItem value="CR">Capital</MenuItem>
        <MenuItem value="SP">S. Peninsula</MenuItem>
        <MenuItem value="WR">West</MenuItem>
        <MenuItem value="WF">Westfjords</MenuItem>
        <MenuItem value="NW">NW</MenuItem>
        <MenuItem value="NE">NE</MenuItem>
        <MenuItem value="ER">East</MenuItem>
        <MenuItem value="SR">South</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <StyledAppBar position="static" elevation={0}>
      <StyledToolBar
        variant="dense"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        {/* LEFT: title and back button */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            gap: 1,
            whiteSpace: 'nowrap',
          }}
        >
          <Box
            component="img"
            src={
              lightMode
                ? '../../../public/fuel-rank-logo-light.svg'
                : '../../../public/fuel-rank-logo-dark.svg'
            }
            alt="Fuel Rank Logo"
            sx={{ height: 32 }}
          />
          <Typography variant={isMobile ? 'subtitle1' : 'h6'}>{title}</Typography>
        </Box>

        {/* CENTER desktop: filters  */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexGrow: 1,
            justifyContent: isMobile ? 'space-between' : 'center',
          }}
        >
          {!isMobile && (
            <>
              <ToggleButtonGroup
                color="primary"
                exclusive
                value={fuelType}
                onChange={fuelHandleChange}
                aria-label="Sort by type of fuel"
                size="small"
              >
                <ToggleButton value="gasoline">Gas</ToggleButton>
                <ToggleButton value="diesel">Diesel</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                color="primary"
                exclusive
                value={closest}
                onChange={closestHandleChange}
                aria-label="Sort by closest or cheapest price"
                size="small"
              >
                <ToggleButton value={true} disabled={closest === true}>
                  Closest
                </ToggleButton>
                <ToggleButton value={false} disabled={closest === false}>
                  Cheapest
                </ToggleButton>
              </ToggleButtonGroup>
              <RegionSelector region={region} onChange={regionHandleChange} />
            </>
          )}
        </Box>

        {/* RIGHT desktop: dark/light theme toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: '100px',
            justifyContent: 'flex-end',
          }}
        >
          <StyledIconButton onClick={toggleTheme}>
            {lightMode ? <DarkModeIcon /> : <LightModeIcon />}
          </StyledIconButton>
        </Box>
      </StyledToolBar>

      {/* MOBILE FILTERS */}
      {isMobile && (
        <Box
          sx={{
            px: 2,
            pb: 1,
            pt: 1,
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <FormControl size="small" fullWidth sx={{ flex: 1 }}>
            <InputLabel>Fuel</InputLabel>
            <Select
              value={fuelType ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setFuelType(value === '' ? null : value);
              }}
              label="Fuel"
            >
              <MenuItem value="">All fuels</MenuItem>
              <MenuItem value="gasoline">Gas</MenuItem>
              <MenuItem value="diesel">Diesel</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth sx={{ flex: 1 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={closest.toString()}
              onChange={(e) => {
                const value = e.target.value === 'true';
                closestHandleChange(e as any, value);
              }}
              label="Order"
            >
              <MenuItem value="true">Closest</MenuItem>
              <MenuItem value="false">Cheapest</MenuItem>
            </Select>
          </FormControl>

          <RegionSelector region={region} onChange={regionHandleChange} />
        </Box>
      )}
      <Snackbar
        open={showCoordsAlert}
        autoHideDuration={5000}
        onClose={() => setShowCoordsAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowCoordsAlert(false)} severity="warning" sx={{ width: '100%' }}>
          Location access required to sort by proximity. Please enable location.
        </Alert>
      </Snackbar>
    </StyledAppBar>
  );
};

export default Header;
