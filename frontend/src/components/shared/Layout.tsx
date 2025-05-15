import { Box } from '@mui/material';
import Header from './Header';
import type { ReactNode } from 'react';

type LayoutProps = {
  title: string;
  children: ReactNode;
};

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <Header title={title} />
      <Box
        sx={{
          width: '100%',
          maxWidth: {
            xs: '100%',
            sm: '600px',
            md: '700px',
            lg: '800px',
          },
          margin: '0 auto',
          padding: {
            xs: 1,
            sm: 2,
            md: 3,
          },
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default Layout;
