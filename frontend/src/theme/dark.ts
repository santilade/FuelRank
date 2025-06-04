import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: {
      default: '#0b0f19',
      paper: '#111827',
    },
  },
});

export default darkTheme;
