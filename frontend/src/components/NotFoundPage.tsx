import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100%',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          minWidth: 300,
        }}
      >
        <Typography variant="h2" sx={{ color: theme.palette.primary.main, mb: 1 }}>
          404
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Page not found.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Sorry, the page you're looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Back to home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
