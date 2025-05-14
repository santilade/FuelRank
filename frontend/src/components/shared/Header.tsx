import {
  AppBar,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Toolbar,
  IconButton,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import React from 'react';
import { styled } from '@mui/material';
import { useSharedContext } from './context';

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
  const { lightMode, setLightMode, fuelType, setFuelType, closest, setClosest } =
    useSharedContext();

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

  const toggleTheme = () => setLightMode((prev: boolean) => !prev);

  return (
    <StyledAppBar position="static" elevation={0}>
      <StyledToolBar variant="dense">
        <Typography variant="h6">{title}</Typography>
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
        <StyledIconButton onClick={toggleTheme}>
          {lightMode ? <DarkModeIcon /> : <LightModeIcon />}
        </StyledIconButton>
      </StyledToolBar>
    </StyledAppBar>
  );
};

export default Header;
