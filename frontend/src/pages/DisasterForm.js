import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Save, Cancel, LocationOn } from '@mui/icons-material';

import { disasterAPI, geocodeAPI } from '../services/api';

const DisasterForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    location_name: '',
    description: '',
    tags: [],
    lat: '',
    lng: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadDisaster();
    }
  }, [id]);

  const loadDisaster = async () => {
    try {
      setLoading(true);
      const response = await disasterAPI.getDisasterById(id);
      const disaster = response.data;
      if (disaster) {
        setFormData({
          title: disaster.title || '',
          location_name: disaster.location_name || '',
          description: disaster.description || '',
          tags: disaster.tags || [],
          lat: disaster.lat || '',
          lng: disaster.lng || '',
        });
      } else {
        setError('Disaster not found');
      }
    } catch (err) {
      setError('Disaster not found');
      console.error('Error loading disaster:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeocode = async () => {
    if (!formData.description) {
      setError('Please enter a description to geocode');
      return;
    }

    try {
      setGeocoding(true);
      setError(null);
      
      const response = await geocodeAPI.geocode(formData.description);
      const { lat, lng, location_name } = response.data;
      
      setFormData(prev => ({
        ...prev,
        lat: lat.toString(),
        lng: lng.toString(),
        location_name: location_name || prev.location_name
      }));
    } catch (err) {
      setError('Failed to geocode location. Please enter coordinates manually.');
      console.error('Geocoding error:', err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim())
      };

      if (formData.lat && formData.lng) {
        submitData.lat = parseFloat(formData.lat);
        submitData.lng = parseFloat(formData.lng);
      }

      if (isEditing) {
        await disasterAPI.updateDisaster(id, submitData);
      } else {
        await disasterAPI.createDisaster(submitData);
      }

      navigate('/disasters');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save disaster');
      console.error('Error saving disaster:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/disasters');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Edit Disaster' : 'Create New Disaster'}
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={4}
                  required
                  helperText="Enter a detailed description. This will be used for geocoding if coordinates are not provided."
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    label="Location Name"
                    value={formData.location_name}
                    onChange={(e) => handleInputChange('location_name', e.target.value)}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<LocationOn />}
                    onClick={handleGeocode}
                    disabled={geocoding || !formData.description}
                  >
                    {geocoding ? 'Geocoding...' : 'Auto-geocode'}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  value={formData.lat}
                  onChange={(e) => handleInputChange('lat', e.target.value)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  value={formData.lng}
                  onChange={(e) => handleInputChange('lng', e.target.value)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={['flood', 'earthquake', 'fire', 'hurricane', 'tornado', 'tsunami']}
                  value={formData.tags}
                  onChange={(event, newValue) => {
                    handleInputChange('tags', newValue);
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags..."
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (isEditing ? 'Update Disaster' : 'Create Disaster')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DisasterForm; 