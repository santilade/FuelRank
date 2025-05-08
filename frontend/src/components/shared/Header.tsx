import { AppBar, Button, ButtonGroup, Typography } from '@mui/material';

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  return (
    <AppBar position="static">
      <Typography variant="h6">{title}</Typography>
      <ButtonGroup variant="contained" aria-label="Basic button group">
        <Button>Gas</Button>
        <Button>Diesel</Button>
      </ButtonGroup>
    </AppBar>
  );
};

export default Header;
