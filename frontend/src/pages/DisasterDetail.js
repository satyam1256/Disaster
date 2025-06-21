import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit,
  ArrowBack,
  LocationOn,
  Warning,
  People,
  LocalHospital,
  Verified,
  Image,
  Refresh,
  Add,
  Report
} from '@mui/icons-material';

import { disasterAPI, resourceAPI } from '../services/api';
import socketService from '../services/socket';

const DisasterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [disaster, setDisaster] = useState(null);
  const [socialMedia, setSocialMedia] = useState([]);
  const [resources, setResources] = useState([]);
  const [officialUpdates, setOfficialUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    lat: '',
    lng: '',
    capacity: '',
    contact_info: '',
    description: ''
  });

  useEffect(() => {
    loadDisasterData();
    
    // Subscribe to real-time updates
    const unsubscribeDisaster = socketService.subscribe('disaster_updated', (data) => {
      if (data.id === id) {
        loadDisasterData();
      }
    });

    const unsubscribeSocial = socketService.subscribe('social_media_updated', (data) => {
      if (data.disaster_id === id) {
        setSocialMedia(data.data);
      }
    });

    const unsubscribeResources = socketService.subscribe('resources_updated', (data) => {
      if (data.disaster_id === id) {
        if (data.resources) {
          setResources(data.resources);
        } else if (data.data) {
          setResources(prev => [...prev, data.data]);
        }
      }
    });

    return () => {
      unsubscribeDisaster();
      unsubscribeSocial();
      unsubscribeResources();
    };
  }, [id]);

  const loadDisasterData = async () => {
    try {
      setLoading(true);
      const [disasterResponse, socialResponse, resourcesResponse, updatesResponse] = await Promise.all([
        disasterAPI.getDisasterById(id),
        disasterAPI.getSocialMedia(id),
        disasterAPI.getResources(id, 40.7128, -74.0060, 10),
        disasterAPI.getOfficialUpdates(id)
      ]);
      setDisaster(disasterResponse.data);
      setSocialMedia(socialResponse.data);
      setResources(resourcesResponse.data.resources || []);
      setOfficialUpdates(updatesResponse.data);
      setError(null);
    } catch (err) {
      setError('Disaster not found');
      setDisaster(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyImage = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    try {
      setVerificationResult(null);
      const response = await disasterAPI.verifyImage(id, imageUrl);
      setVerificationResult(response.data.result);
      setShowImageDialog(false);
    } catch (err) {
      setError('Failed to verify image');
      console.error('Error verifying image:', err);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.name || !newResource.type || !newResource.lat || !newResource.lng) {
      setError('All resource fields are required');
      return;
    }

    try {
      await resourceAPI.createResource({
        ...newResource,
        disaster_id: id,
        lat: parseFloat(newResource.lat),
        lng: parseFloat(newResource.lng)
      });
      setShowResourceDialog(false);
      setNewResource({ name: '', type: '', lat: '', lng: '', capacity: '', contact_info: '', description: '' });
      loadDisasterData();
    } catch (err) {
      setError('Failed to add resource');
      console.error('Error adding resource:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!disaster) {
    return (
      <Alert severity="error">
        Disaster not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/disasters')}
        >
          Back to Disasters
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {disaster.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/disasters/${id}/edit`)}
        >
          Edit
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Disaster Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {disaster.title}
              </Typography>
              <Typography color="textSecondary" paragraph>
                {disaster.description}
              </Typography>
              
              <Box display="flex" gap={1} mb={2}>
                {disaster.tags?.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                {disaster.location_name && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">
                      {disaster.location_name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Created: {new Date(disaster.created_at).toLocaleDateString()}
              </Typography>
              {disaster.lat && disaster.lng && (
                <Typography variant="body2" color="textSecondary">
                  Coordinates: {disaster.lat.toFixed(4)}, {disaster.lng.toFixed(4)}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Social Media" />
            <Tab label="Reports" />
            <Tab label="Resources" />
            <Tab label="Official Updates" />
            <Tab label="Image Verification" />
          </Tabs>

          {/* Social Media Tab */}
          {activeTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Social Media Reports</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => disasterAPI.getSocialMedia(id).then(res => setSocialMedia(res.data))}
                >
                  Refresh
                </Button>
              </Box>
              
              {socialMedia.length === 0 ? (
                <Typography color="textSecondary">No social media reports available</Typography>
              ) : (
                <List>
                  {socialMedia.map((post, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <People />
                        </ListItemIcon>
                        <ListItemText
                          primary={post.post}
                          secondary={`${post.user} • ${new Date(post.timestamp).toLocaleString()}`}
                        />
                      </ListItem>
                      {index < socialMedia.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Reports Tab */}
          {activeTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Citizen Reports</Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Report />}
                    onClick={() => navigate(`/disasters/${id}/reports`)}
                  >
                    View All Reports
                  </Button>
                </Box>
              </Box>
              
              <Typography color="textSecondary" paragraph>
                View and manage citizen-submitted reports for this disaster. Click "View All Reports" to see the complete list with verification controls.
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/reports/new')}
                sx={{ mt: 2 }}
              >
                Submit New Report
              </Button>
            </Box>
          )}

          {/* Resources Tab */}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Available Resources</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowResourceDialog(true)}
                >
                  Add Resource
                </Button>
              </Box>
              
              {resources.length === 0 ? (
                <Typography color="textSecondary">No resources available</Typography>
              ) : (
                <Grid container spacing={2}>
                  {resources.map((resource, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {resource.name}
                          </Typography>
                          <Chip label={resource.type} size="small" sx={{ mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            {resource.description}
                          </Typography>
                          {resource.capacity && (
                            <Typography variant="body2">
                              Capacity: {resource.capacity}
                            </Typography>
                          )}
                          {resource.contact_info && (
                            <Typography variant="body2">
                              Contact: {resource.contact_info}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Official Updates Tab */}
          {activeTab === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Official Updates</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => disasterAPI.getOfficialUpdates(id).then(res => setOfficialUpdates(res.data))}
                >
                  Refresh
                </Button>
              </Box>
              
              {officialUpdates.length === 0 ? (
                <Typography color="textSecondary">No official updates available</Typography>
              ) : (
                <List>
                  {officialUpdates.map((update, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Verified />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <a href={update.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                              {update.title}
                            </a>
                          }
                          secondary={`${update.source} • ${new Date(update.pubDate).toLocaleDateString()}`}
                        />
                      </ListItem>
                      {index < officialUpdates.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Image Verification Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Image Verification
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<Image />}
                onClick={() => setShowImageDialog(true)}
                sx={{ mb: 2 }}
              >
                Verify New Image
              </Button>

              {verificationResult && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Verification Result:</strong> {verificationResult}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Image Verification Dialog */}
      <Dialog open={showImageDialog} onClose={() => setShowImageDialog(false)}>
        <DialogTitle>Verify Image</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImageDialog(false)}>Cancel</Button>
          <Button onClick={handleVerifyImage} variant="contained">
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Resource Dialog */}
      <Dialog open={showResourceDialog} onClose={() => setShowResourceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Name"
                value={newResource.name}
                onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Type"
                value={newResource.type}
                onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                placeholder="e.g., shelter, food, medical"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={newResource.lat}
                onChange={(e) => setNewResource(prev => ({ ...prev, lat: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={newResource.lng}
                onChange={(e) => setNewResource(prev => ({ ...prev, lng: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={newResource.capacity}
                onChange={(e) => setNewResource(prev => ({ ...prev, capacity: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Information"
                value={newResource.contact_info}
                onChange={(e) => setNewResource(prev => ({ ...prev, contact_info: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newResource.description}
                onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResourceDialog(false)}>Cancel</Button>
          <Button onClick={handleAddResource} variant="contained">
            Add Resource
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DisasterDetail; 