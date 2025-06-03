import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { SharedProvider, useSharedContext } from './context/context';
import PriceListPage from './components/PriceListPage';
import NotFoundPage from './components/NotFoundPage';
import Layout from './components/Layout/Layout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function AppContent() {
  const { lightMode } = useSharedContext();
  const theme = lightMode ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout title="FuelRank">
        <Routes>
          <Route path="/" element={<PriceListPage />} />
          <Route path="*" element={<NotFoundPage />} />
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
