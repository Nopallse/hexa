import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
    craft: {
      blush: string;
      mint: string;
      sky: string;
      cream: string;
      lavender: string;
      rose: string;
    };
  }

  interface ThemeOptions {
    status?: {
      danger?: string;
    };
    craft?: {
      blush?: string;
      mint?: string;
      sky?: string;
      cream?: string;
      lavender?: string;
      rose?: string;
    };
  }

  interface Palette {
    craft: {
      blush: string;
      mint: string;
      sky: string;
      cream: string;
      lavender: string;
      rose: string;
    };
  }

  interface PaletteOptions {
    craft?: {
      blush?: string;
      mint?: string;
      sky?: string;
      cream?: string;
      lavender?: string;
      rose?: string;
    };
  }

  interface TypographyVariants {
    craft: {
      heading: React.CSSProperties;
      subheading: React.CSSProperties;
      body: React.CSSProperties;
      caption: React.CSSProperties;
    };
  }

  interface TypographyVariantsOptions {
    craft?: {
      heading?: React.CSSProperties;
      subheading?: React.CSSProperties;
      body?: React.CSSProperties;
      caption?: React.CSSProperties;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#9682DB',      // Violet utama
      light: '#C4B5E8',     // Violet lebih lembut
      dark: '#6A58A3',      // Violet lebih gelap
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#A682DB',      // Purple-pink pastel
      light: '#C2A6E8',     // Versi lebih cerah
      dark: '#7458A3',      // Versi lebih pekat
      contrastText: '#FFFFFF',
    },
    // Craft Aesthetic Colors
    success: {
      main: '#B8E6B8',      // Mint green - craft pastel
      light: '#D4F0D4',
      dark: '#9CD69C',
      contrastText: '#2E7D32',
    },
    info: {
      main: '#B8D4E8',      // Sky blue - craft pastel
      light: '#D1E5F0',
      dark: '#9BC2D8',
      contrastText: '#1565C0',
    },
    warning: {
      main: '#F4E4C1',      // Cream - craft pastel
      light: '#F8EDD1',
      dark: '#E8D4A1',
      contrastText: '#E65100',
    },
    error: {
      main: '#E8B4B8',      // Blush pink - craft pastel
      light: '#F0C8CC',
      dark: '#D49CA0',
      contrastText: '#C62828',
    },
    background: {
      default: '#FAF8FF',   // Soft lavender background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D2D2D',   // Slightly softer black
      secondary: '#6B6B6B', // Warmer gray
    },
    // Craft-specific colors
    craft: {
      blush: '#E8B4B8',
      mint: '#B8E6B8',
      sky: '#B8D4E8',
      cream: '#F4E4C1',
      lavender: '#E8E0FF',
      rose: '#F8E8E8',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
    // Craft Aesthetic Typography
    h1: {
      fontSize: '2.2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      fontFamily: '"Playfair Display", "Georgia", serif',
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      fontFamily: '"Playfair Display", "Georgia", serif',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      fontFamily: '"Playfair Display", "Georgia", serif',
    },
    h4: {
      fontSize: '1.3rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    // Craft-specific typography
    craft: {
      heading: {
        fontFamily: '"Playfair Display", "Georgia", serif',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      subheading: {
        fontFamily: '"Playfair Display", "Georgia", serif',
        fontWeight: 400,
        fontStyle: 'italic',
        letterSpacing: '-0.01em',
      },
      body: {
        fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
        fontWeight: 300,
        lineHeight: 1.7,
      },
      caption: {
        fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
        fontWeight: 500,
        fontSize: '0.85rem',
        letterSpacing: '0.5px',
      },
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8, // More reasonable border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.9rem',
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '0.3px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(150, 130, 219, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(150, 130, 219, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(150, 130, 219, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: 12,
          border: '1px solid rgba(150, 130, 219, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(150, 130, 219, 0.5)',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9682DB',
                borderWidth: 1.5,
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          letterSpacing: '0.2px',
          fontSize: '0.8rem',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.craft-heading': {
            fontFamily: '"Playfair Display", "Georgia", serif',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
          '&.craft-subheading': {
            fontFamily: '"Playfair Display", "Georgia", serif',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '-0.01em',
          },
          '&.craft-body': {
            fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
            fontWeight: 300,
            lineHeight: 1.7,
          },
          '&.craft-caption': {
            fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
            fontWeight: 500,
            fontSize: '0.85rem',
            letterSpacing: '0.5px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default gradient
        },
        elevation1: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
  status: {
    danger: '#F44336',
  },
});

export default theme;
