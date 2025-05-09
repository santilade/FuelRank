import { Box } from '@mui/material';
import Header from './Header';
import type { ReactNode } from 'react';

type LayoutProps = {
  title: string;
  children: ReactNode;
  lightMode: boolean;
  setLightMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const Layout = ({ title, children, lightMode, setLightMode }: LayoutProps) => {
  return (
    <>
      <Header title={title} lightMode={lightMode} setLightMode={setLightMode} />
      <Box
        sx={{
          width: '100%',
          maxWidth: {
            xs: '100%', // móviles
            sm: '600px', // tablets
            md: '700px', // laptops
            lg: '800px', // pantallas grandes
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
