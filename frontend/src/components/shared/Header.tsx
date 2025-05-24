import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React, { useState } from 'react';
import { useSharedContext } from './context';
import {
  AppBar,
  styled,
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
import { useLocation, useNavigate, Link } from 'react-router-dom';

//TODO: filtro por region, adaptado a vista movil

type HeaderProps = {
  title: string;
};

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
  const location = useLocation();
  const navigate = useNavigate();

  const isDetailPage = location.pathname.startsWith('/station/');
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
  } = useSharedContext();

  const toggleTheme = () => setLightMode((prev: boolean) => !prev);

  const fuelHandleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    setFuelType(newValue);
  };

  const closestHandleChange = (_event: React.MouseEvent<HTMLElement>, newValue: boolean) => {
    setClosest(newValue);
    if (newValue !== null) {
      setClosest(newValue);
    }
  };

  const regionHandleChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    setRegion(value === 'None' ? null : value);
  };

  return (
    <StyledAppBar position="static" elevation={0}>
      <StyledToolBar variant="dense" sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* LEFT section */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '100px' }}>
          {isDetailPage ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => navigate('/')}
            >
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* FILTERS */}
              {isMobile ? (
                <>
                  <FormControl size="small">
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
                  <FormControl size="small" sx={{ minWidth: 80, mr: 1 }}>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={closest}
                      onChange={(e) => setClosest(e.target.value === 'true')}
                      label="Order"
                    >
                      <MenuItem value="true">Closest</MenuItem>
                      <MenuItem value="false">Cheapest</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Region</InputLabel>
                    <Select value={region ?? 'None'} label="region" onChange={regionHandleChange}>
                      <MenuItem value={'None'}>
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={'CR'}>Capital Region</MenuItem>
                      <MenuItem value={'SP'}>Southern Peninsula</MenuItem>
                      <MenuItem value={'WR'}>Western Region</MenuItem>
                      <MenuItem value={'WF'}>Westfjords</MenuItem>
                      <MenuItem value={'NW'}>Northwestern Region</MenuItem>
                      <MenuItem value={'NE'}>Northeastern Region</MenuItem>
                      <MenuItem value={'ER'}>Eastern Region</MenuItem>
                      <MenuItem value={'SR'}>Southern Region</MenuItem>
                    </Select>
                  </FormControl>
                </>
              ) : (
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
                </>
              )}
            </Box>
          )}
        </Box>

        {/* CENTRAL section */}

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: isMobile ? 'space-between' : 'center',
          }}
        >
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            component={Link}
            to="/"
            sx={{
              ...(isMobile
                ? {}
                : {
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }),
              textDecoration: 'none',
              color: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* RIGHT section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 'auto',
            justifyContent: 'flex-end',
          }}
        >
          <StyledIconButton onClick={toggleTheme}>
            {lightMode ? <DarkModeIcon /> : <LightModeIcon />}
          </StyledIconButton>
        </Box>
      </StyledToolBar>
    </StyledAppBar>
  );
};

export default Header;
