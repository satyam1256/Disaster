import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Warning } from '@mui/icons-material';

import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { createAppTheme } from './theme/theme';
import { useTheme } from './contexts/ThemeContext';

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
import ThemeToggle from './components/ThemeToggle';

function AppContent() {
  const { darkMode } = useTheme();
  const theme = createAppTheme(darkMode);

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
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Warning sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Disaster Response Platform
              </Typography>
              <ThemeToggle />
            </Toolbar>
          </AppBar>
          
          <Box sx={{ mt: 2, mb: 1, px: 2 }}>
            <UserSelector />
          </Box>
          
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

function App() {
  return (
    <CustomThemeProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </CustomThemeProvider>
  );
}

export default App;
