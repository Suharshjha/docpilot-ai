import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff', // Vibrant Violet
      light: '#b47cff',
      dark: '#3f1dcb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00e5ff', // Electric Teal
      light: '#33ebff',
      dark: '#00a0b2',
      contrastText: '#0a0e1a',
    },
    background: {
      default: '#0a0e1a', // Deep Space Slate
      paper: '#111827',   // Slate Gray Paper
    },
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontFamily: 'Outfit, sans-serif',
    },
    h2: {
      fontWeight: 700,
      fontFamily: 'Outfit, sans-serif',
    },
    h3: {
      fontWeight: 600,
      fontFamily: 'Outfit, sans-serif',
    },
    h4: {
      fontWeight: 600,
      fontFamily: 'Outfit, sans-serif',
    },
    h5: {
      fontWeight: 600,
      fontFamily: 'Outfit, sans-serif',
    },
    h6: {
      fontWeight: 600,
      fontFamily: 'Outfit, sans-serif',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontFamily: 'Inter, sans-serif',
    },
    body1: {
      fontFamily: 'Inter, sans-serif',
    },
    body2: {
      fontFamily: 'Inter, sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(124, 77, 255, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 229, 255, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
