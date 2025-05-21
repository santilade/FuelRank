import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as React from 'react';
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
  Button,
} from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';

//TODO: filtro por region, adaptado a vista movil

type HeaderProps = {
  title: string;
};

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledToolBar = styled(Toolbar)(({ theme }) => ({
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
  const { lightMode, setLightMode, fuelType, setFuelType, closest, setClosest, isMobile } =
    useSharedContext();

  const toggleTheme = () => setLightMode((prev: boolean) => !prev);

  const fuelHandleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    setFuelType(newValue);
  };

  const closestHandleChange = (_event: React.MouseEvent<HTMLElement>, newValue: boolean) => {
    setClosest(newValue);
    if (newValue !== null) {
      setClosest(newValue);
    }
    console.log('closest: ', newValue);
  };

  return (
    <StyledAppBar position="static" elevation={0}>
      <StyledToolBar variant="dense">
        <Typography
          variant="h6"
          component={Link}
          to={'/'}
          sx={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          {title}
        </Typography>
        {isDetailPage ? (
          <Button onClick={() => navigate('/')} size="small" variant="outlined">
            <Typography variant="button">← Back</Typography>
          </Button>
        ) : (
          <>
            {isMobile ? (
              <FormControl size="small" sx={{ minWidth: 80, mx: 1 }}>
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
            ) : (
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
            )}

            {isMobile ? (
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
            ) : (
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
            )}
          </>
        )}

        <StyledIconButton onClick={toggleTheme}>
          {lightMode ? <DarkModeIcon /> : <LightModeIcon />}
        </StyledIconButton>
      </StyledToolBar>
    </StyledAppBar>
  );
};

export default Header;
