import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { SharedProvider, useSharedContext } from './components/shared/context';
import PriceListPage from './components/priceList/PriceListPage';
import Layout from './components/shared/Layout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StationDetailPage from './components/stationDetail/StationDetailPage';

function AppContent() {
  const { lightMode } = useSharedContext();
  const theme = lightMode ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout title="FuelRank">
        <Routes>
          <Route path="/" element={<PriceListPage />} />
          <Route path="/station/:id" element={<StationDetailPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

function App() {
  return (
    <SharedProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SharedProvider>
  );
}

export default App;
