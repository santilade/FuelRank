import './App.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import PriceListPage from './components/priceList/PriceListPage';
import { useState } from 'react';
import Layout from './components/shared/Layout';

function App() {
  const [lightMode, setLightMode] = useState(false);
  const theme = lightMode ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Layout title="FuelRank" lightMode={lightMode} setLightMode={setLightMode}>
          <PriceListPage />
        </Layout>
      </div>
    </ThemeProvider>
  );
}

export default App;
