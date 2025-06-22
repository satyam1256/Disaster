import { createTheme } from '@mui/material/styles';

export const createAppTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: darkMode ? '#ff6b6b' : '#e74c3c', // Red for emergency/disaster theme
      light: darkMode ? '#ff8e8e' : '#ff7675',
      dark: darkMode ? '#d63031' : '#c0392b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: darkMode ? '#74b9ff' : '#3498db', // Blue for secondary actions
      light: darkMode ? '#a29bfe' : '#74b9ff',
      dark: darkMode ? '#0984e3' : '#2d3436',
      contrastText: '#ffffff',
    },
    background: {
      default: darkMode ? '#0f0f23' : '#f8f9fa',
      paper: darkMode ? '#1a1a2e' : '#ffffff',
    },
    surface: {
      main: darkMode ? '#16213e' : '#ffffff',
      light: darkMode ? '#0f3460' : '#f1f3f4',
    },
    text: {
      primary: darkMode ? '#ffffff' : '#2c3e50',
      secondary: darkMode ? '#b2bec3' : '#7f8c8d',
    },
    error: {
      main: darkMode ? '#ff7675' : '#e74c3c',
    },
    warning: {
      main: darkMode ? '#fdcb6e' : '#f39c12',
    },
    success: {
      main: darkMode ? '#00b894' : '#27ae60',
    },
    info: {
      main: darkMode ? '#74b9ff' : '#3498db',
    },
    divider: darkMode ? '#2d3436' : '#ecf0f1',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: darkMode 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          boxShadow: darkMode 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(231, 76, 60, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: darkMode ? '#1a1a2e' : '#ffffff',
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 8px 32px rgba(0,0,0,0.1)',
          border: darkMode ? '1px solid #2d3436' : '1px solid #ecf0f1',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: darkMode 
              ? '0 12px 40px rgba(0,0,0,0.4)'
              : '0 12px 40px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          },
        },
        contained: {
          background: darkMode 
            ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
            : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          '&:hover': {
            background: darkMode 
              ? 'linear-gradient(135deg, #ff5252 0%, #d63031 100%)'
              : 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: darkMode ? '1px solid #2d3436' : '1px solid #ecf0f1',
        },
        head: {
          fontWeight: 600,
          backgroundColor: darkMode ? '#16213e' : '#f8f9fa',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: darkMode
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.04)',
            transition: 'background-color 0.2s ease-in-out',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: darkMode
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
  },
}); 