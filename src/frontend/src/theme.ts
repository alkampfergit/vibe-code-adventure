import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff00',
    },
    secondary: {
      main: '#ff00ff',
    },
    background: {
      default: '#000000',
      paper: '#111111',
    },
    text: {
      primary: '#00ff00',
      secondary: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'monospace',
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#00ff00',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid #00ff00',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
          fontFamily: 'monospace',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            fontFamily: 'monospace',
          },
        },
      },
    },
  },
})