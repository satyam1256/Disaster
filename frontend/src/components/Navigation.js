import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import { Home, Add, List, LocationOn, Report } from '@mui/icons-material';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/disasters/new') || path.startsWith('/disasters/') && path.includes('/edit')) return 1;
    if (path.startsWith('/disasters')) return 2;
    if (path.startsWith('/reports')) return 3;
    if (path.startsWith('/geocoding')) return 4;
    return 0;
  };

  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/disasters/new');
        break;
      case 2:
        navigate('/disasters');
        break;
      case 3:
        navigate('/reports');
        break;
      case 4:
        navigate('/geocoding');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Tabs 
        value={getCurrentTab()} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 2 }}
      >
        <Tab 
          icon={<Home />} 
          label="Dashboard" 
          iconPosition="start"
        />
        <Tab 
          icon={<Add />} 
          label="New Disaster" 
          iconPosition="start"
        />
        <Tab 
          icon={<List />} 
          label="Disasters" 
          iconPosition="start"
        />
        <Tab 
          icon={<Report />} 
          label="REPORTS" 
          iconPosition="start"
        />
        <Tab 
          icon={<LocationOn />} 
          label="Geocoding" 
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );
};

export default Navigation; 