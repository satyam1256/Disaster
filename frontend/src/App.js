import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Warning, Home, Add, List, LocationOn } from '@mui/icons-material';

import socketService from './services/socket';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import DisasterForm from './pages/DisasterForm';
import DisasterList from './pages/DisasterList';
import DisasterDetail from './pages/DisasterDetail';
import ReportForm from './pages/ReportForm';
import ReportsList from './pages/ReportsList';
import GeocodingTool from './pages/GeocodingTool';
import UserSelector from './components/UserSelector';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f', // Red for emergency/disaster theme
    },
    secondary: {
      main: '#1976d2', // Blue for secondary actions
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

function App() {
  useEffect(() => {
    // Connect to Socket.IO on app start
    socketService.connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserSelector />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Warning sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Disaster Response Platform
              </Typography>
            </Toolbar>
          </AppBar>
          
          <Navigation />
          
          <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/disasters" element={<DisasterList />} />
              <Route path="/disasters/new" element={<DisasterForm />} />
              <Route path="/disasters/:id" element={<DisasterDetail />} />
              <Route path="/disasters/:id/edit" element={<DisasterForm />} />
              <Route path="/disasters/:disasterId/reports" element={<ReportsList />} />
              <Route path="/reports/new" element={<ReportForm />} />
              <Route path="/geocoding" element={<GeocodingTool />} />
              <Route path="/reports" element={<ReportsList />} />
              <Route path="/reports/:id/edit" element={<ReportForm editMode={true} />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
