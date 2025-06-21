import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Warning, 
  LocationOn, 
  TrendingUp,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { disasterAPI } from '../services/api';
import socketService from '../services/socket';

const Dashboard = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDisasters();
    
    // Subscribe to real-time updates
    const unsubscribeDisaster = socketService.subscribe('disaster_updated', (data) => {
      setRealtimeUpdates(prev => [...prev.slice(-4), { type: 'disaster', data, timestamp: new Date() }]);
      loadDisasters(); // Refresh disasters list
    });

    return () => {
      unsubscribeDisaster();
    };
  }, []);

  const loadDisasters = async () => {
    try {
      setLoading(true);
      const response = await disasterAPI.getDisasters();
      setDisasters(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading disasters:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDisasterStats = () => {
    const total = disasters.length;
    const active = disasters.filter(d => d.status !== 'resolved').length;
    const resolved = total - active;
    const withLocation = disasters.filter(d => d.location).length;
    return { total, active, resolved, withLocation };
  };

  const stats = getDisasterStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Disaster Response Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />}
          onClick={loadDisasters}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Disasters
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active
                  </Typography>
                  <Typography variant="h4">
                    {stats.active}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationOn color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    With Location
                  </Typography>
                  <Typography variant="h4">
                    {stats.withLocation}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Disasters */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Recent Disasters
              </Typography>
              {disasters.length === 0 ? (
                <Typography color="textSecondary">
                  No disasters found. Create your first disaster to get started.
                </Typography>
              ) : (
                <Box>
                  {disasters.slice(0, 5).map((disaster) => (
                    <Box 
                      key={disaster.id} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 1, 
                        mb: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                      onClick={() => navigate(`/disasters/${disaster.id}`)}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {disaster.title}
                          </Typography>
                          <Typography color="textSecondary" gutterBottom>
                            {disaster.location_name}
                          </Typography>
                          <Typography variant="body2" noWrap>
                            {disaster.description}
                          </Typography>
                        </Box>
                        <Box>
                          {disaster.tags?.map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                  {disasters.length > 5 && (
                    <Button 
                      variant="text" 
                      onClick={() => navigate('/disasters')}
                      sx={{ mt: 2 }}
                    >
                      View All Disasters
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Real-Time Updates
              </Typography>
              {realtimeUpdates.length === 0 ? (
                <Typography color="textSecondary">
                  No recent updates. Activity will appear here in real-time.
                </Typography>
              ) : (
                <Box>
                  {realtimeUpdates.map((update, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        p: 1.5, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 1, 
                        mb: 1.5 
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {update.timestamp.toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2">
                        {update.type === 'disaster' && 'Disaster updated'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 