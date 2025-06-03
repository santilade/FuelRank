import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import type { LayoutProps } from '../../types/types';

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header title={title} />
      <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default Layout;
