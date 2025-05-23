import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import type { ReactNode } from 'react';

type LayoutProps = {
  title: string;
  children: ReactNode;
};

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
      <Box sx={{ flex: 1, overflow: 'hidden' }}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default Layout;
