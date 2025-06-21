import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { Send, Cancel, Image } from '@mui/icons-material';

import { disasterAPI, reportAPI } from '../services/api';

const ReportForm = ({ editMode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    disaster_id: '',
    content: '',
    image_url: '',
    user_id: 'citizen_reporter',
    verification_status: 'pending'
  });

  useEffect(() => {
    loadDisasters();
    if (editMode && id) {
      loadReport();
    }
  }, [editMode, id]);

  const loadDisasters = async () => {
    try {
      setLoading(true);
      const response = await disasterAPI.getDisasters();
      setDisasters(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load disasters');
      console.error('Error loading disasters:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getReport(id);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load report');
      console.error('Error loading report:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.disaster_id || !formData.content || !formData.user_id) {
      setError('Please select a disaster, enter report content, and provide your user ID');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      if (editMode && id) {
        await reportAPI.updateReport(id, formData);
      } else {
        await reportAPI.createReport(formData);
      }
      
      setSuccess(true);
      setFormData({
        disaster_id: '',
        content: '',
        image_url: '',
        user_id: 'citizen_reporter',
        verification_status: 'pending'
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/reports');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/reports');
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
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
        Submit Social Media Report
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Report submitted successfully! Redirecting to reports...
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Disaster</InputLabel>
                  <Select
                    value={formData.disaster_id}
                    label="Select Disaster"
                    onChange={(e) => handleInputChange('disaster_id', e.target.value)}
                  >
                    {disasters.map((disaster) => (
                      <MenuItem key={disaster.id} value={disaster.id}>
                        {disaster.title} - {disaster.location_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Report Content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  multiline
                  rows={4}
                  required
                  placeholder="Describe what you're seeing or experiencing..."
                  helperText="Provide detailed information about the situation"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL (Optional)"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  InputProps={{
                    startAdornment: <Image sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  helperText="Link to an image that supports your report"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reporter Name/ID"
                  value={formData.user_id}
                  onChange={(e) => handleInputChange('user_id', e.target.value)}
                  placeholder="Your name or handle"
                  required
                  helperText="Your username or identifier"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Verification Status</InputLabel>
                  <Select
                    value={formData.verification_status}
                    label="Verification Status"
                    onChange={(e) => handleInputChange('verification_status', e.target.value)}
                  >
                    <MenuItem value="pending">
                      <Chip label="Pending" color="warning" size="small" />
                    </MenuItem>
                    <MenuItem value="verified">
                      <Chip label="Verified" color="success" size="small" />
                    </MenuItem>
                    <MenuItem value="rejected">
                      <Chip label="Rejected" color="error" size="small" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={submitting}
                  >
                    {editMode ? 'Update Report' : 'Submit Report'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {formData.content && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Preview
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                @{formData.user_id} • {new Date().toLocaleString()}
              </Typography>
              <Typography variant="body1" paragraph>
                {formData.content}
              </Typography>
              {formData.image_url && (
                <Typography variant="body2" color="primary">
                  📷 Image attached: {formData.image_url}
                </Typography>
              )}
              <Box mt={1}>
                <Chip
                  label={`Status: ${formData.verification_status}`}
                  color={getVerificationStatusColor(formData.verification_status)}
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReportForm; 