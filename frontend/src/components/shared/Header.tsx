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
  const { lightMode, setLightMode, fuelType, setFuelType } = useSharedContext();

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    setFuelType(newValue);
    console.log(newValue);
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
          onChange={handleChange}
          aria-label="Platform"
          size="small"
        >
          <ToggleButton value="gasoline">Gas</ToggleButton>
          <ToggleButton value="diesel">Diesel</ToggleButton>
        </ToggleButtonGroup>
        <StyledIconButton onClick={toggleTheme}>
          {lightMode ? <DarkModeIcon /> : <LightModeIcon />}
        </StyledIconButton>
      </StyledToolBar>
    </StyledAppBar>
  );
};

export default Header;
