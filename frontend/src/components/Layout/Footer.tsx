import { Box, IconButton, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        padding: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmailIcon fontSize="small" />
        <Link href="mailto:fuelr@pm.me" target="_blank" rel="noopener noreferrer">
          fuelr@pm.me
        </Link>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link
          href="https://github.com/Ivarsky/FuelRank/blob/main/README.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          About
        </Link>
        <IconButton
          component="a"
          href="https://github.com/Ivarsky"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <GitHubIcon />
        </IconButton>
        <IconButton
          component="a"
          href="https://www.linkedin.com/in/ivan-antonio-martin-hernandez/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <LinkedInIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Footer;
