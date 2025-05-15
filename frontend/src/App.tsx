import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { SharedProvider, useSharedContext } from './components/shared/context';
import PriceListPage from './components/priceList/PriceListPage';
import Layout from './components/shared/Layout';

function AppContent() {
  const { lightMode } = useSharedContext();
  const theme = lightMode ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout title="FuelRank">
        <PriceListPage />
      </Layout>
    </ThemeProvider>
  );
}

function App() {
  return (
    <SharedProvider>
      <AppContent />
    </SharedProvider>
  );
}

export default App;
