import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { LocationOn, Search, Clear } from '@mui/icons-material';

import { geocodeAPI } from '../services/api';

const GeocodingTool = () => {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeocode = async () => {
    if (!description.trim()) {
      setError('Please enter a description to geocode');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const response = await geocodeAPI.geocode(description);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to geocode location');
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDescription('');
    setResult(null);
    setError(null);
  };

  const exampleDescriptions = [
    "Flooding in downtown Manhattan near Times Square",
    "Earthquake damage in San Francisco Bay Area",
    "Hurricane evacuation center in Miami Beach",
    "Tornado damage in Oklahoma City suburbs",
    "Wildfire evacuation route in Los Angeles County"
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Geocoding Tool
      </Typography>
      
      <Typography color="textSecondary" paragraph>
        Test the geocoding API by entering a description of a location. The system will extract the location name and provide coordinates.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enter Description
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Location Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                placeholder="Describe a location or disaster area..."
                sx={{ mb: 2 }}
              />

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleGeocode}
                  disabled={loading || !description.trim()}
                  sx={{ flexGrow: 1 }}
                >
                  {loading ? 'Geocoding...' : 'Geocode Location'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Example Descriptions:
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {exampleDescriptions.map((example, index) => (
                    <Button
                      key={index}
                      variant="text"
                      size="small"
                      onClick={() => setDescription(example)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {example}
                    </Button>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              
              {loading && (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              )}

              {result && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <LocationOn color="primary" />
                    <Typography variant="h6">
                      {result.location_name}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Latitude
                      </Typography>
                      <Typography variant="h6">
                        {result.lat}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Longitude
                      </Typography>
                      <Typography variant="h6">
                        {result.lng}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Coordinates
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {result.lat}, {result.lng}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {!loading && !result && (
                <Box textAlign="center" py={4}>
                  <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="textSecondary">
                    Enter a description and click "Geocode Location" to see results
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* API Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="body2" paragraph>
            This tool uses the Gemini AI API to extract location names from descriptions, then uses the Geoapify API to convert those location names into precise coordinates.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Step 1: AI extracts location name from description<br/>
            • Step 2: Geocoding service converts location to coordinates<br/>
            • Step 3: Results are cached for future use
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GeocodingTool; 