import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Import pages (to be created)
import LoginPage from './pages/LoginPage';
import MemberDashboard from './pages/MemberDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PartnerDirectory from './pages/PartnerDirectory';
import QRCodeScanner from './pages/QRCodeScanner';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
              backgroundAttachment: 'fixed',
            }}
          >
            <Routes>
              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Member Routes */}
              <Route path="/member" element={<MemberDashboard />} />
              <Route path="/member/partners" element={<PartnerDirectory />} />
              
              {/* Partner Routes */}
              <Route path="/partner" element={<PartnerDashboard />} />
              <Route path="/partner/scanner" element={<QRCodeScanner />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;