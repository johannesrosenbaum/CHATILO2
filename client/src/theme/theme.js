import { createTheme } from '@mui/material/styles';

// COOLER CHATILO GRADIENT THEME 🌈
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Indigo base
      light: '#a5b4fc',
      dark: '#4338ca',
    },
    secondary: {
      main: '#ec4899',
      light: '#f9a8d4',
      dark: '#be185d',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 25%, #f5576c 50%, #f093fb 75%, #00d2ff 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
            transform: 'translateY(-2px)',
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      }
    }
  }
});

export default theme;
