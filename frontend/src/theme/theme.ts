import { PaletteMode, ThemeOptions } from '@mui/material';

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode Palette
          primary: {
            main: '#007BFF', 
          },
          secondary: {
            main: '#00C8C8', 
          },
          background: {
            default: '#F8F8FA', 
            paper: '#FFFFFF', 
          },
          text: {
            primary: '#1A1A1A', 
            secondary: '#333333', 
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Dark Mode Palette
          primary: {
            main: '#61AFEF', 
          },
          secondary: {
            main: '#56B6C2',
          },
          background: {
            default: '#1A1A1A',
            paper: '#282C34', 
          },
          text: {
            primary: '#E0E0E0', 
            secondary: '#B0B0B0', 
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
        fontWeight: 600,
    },
    body1: {
        fontSize: '1rem',
    },
    button: {
        textTransform: 'none', 
        fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, 
          padding: '10px 20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.05)',
            '& fieldset': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
                borderColor: mode === 'light' ? '#007BFF' : '#61AFEF',
            },
          },
        },
      },
    },
    MuiSelect: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'light' ? '#007BFF' : '#61AFEF',
                },
            },
        },
    },
    MuiPaper: { // For cards and surfaces
        styleOverrides: {
            root: {
                borderRadius: 12, // More rounded corners for sleekness
                boxShadow: mode === 'light'
                    ? '0px 4px 20px rgba(0, 0, 0, 0.05)'
                    : '0px 4px 20px rgba(0, 0, 0, 0.3)',
            },
        },
    },
    MuiContainer: {
        styleOverrides: {
            root: {
                // Add padding for content
                paddingLeft: '24px',
                paddingRight: '24px',
                '@media (min-width: 600px)': {
                    paddingLeft: '48px',
                    paddingRight: '48px',
                },
            }
        }
    }
  },
});