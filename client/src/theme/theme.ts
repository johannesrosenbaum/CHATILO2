import { createTheme } from '@mui/material/styles';

const gradients = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
  secondary: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
  background: '#ffffff',
  card: '#ffffff',
  glass: 'rgba(99, 102, 241, 0.05)',
  glassDark: 'rgba(0, 0, 0, 0.03)',
  border: 'rgba(99, 102, 241, 0.1)',
  accent: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
};
export { gradients };

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      disabled: '#9ca3af',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1f2937',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1f2937',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1f2937',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#1f2937',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      color: '#1f2937',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#1f2937',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#4b5563',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6b7280',
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#ffffff',
          minHeight: '100vh',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f3f4f6',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px 0 rgba(99, 102, 241, 0.15)',
            borderColor: '#c7d2fe',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          fontWeight: 500,
          textTransform: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          boxShadow: '0 2px 4px 0 rgba(99, 102, 241, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
            boxShadow: '0 4px 12px 0 rgba(99, 102, 241, 0.4)',
          },
        },
        outlined: {
          border: '1.5px solid #e5e7eb',
          color: '#6b7280',
          '&:hover': {
            border: '1.5px solid #6366f1',
            background: 'rgba(99, 102, 241, 0.05)',
            color: '#6366f1',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            background: '#f9fafb',
            '& fieldset': {
              borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: '#c7d2fe',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '2px 8px',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          color: '#6366f1',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.15)',
          },
        },
      },
    },
  },
});

export default theme; 