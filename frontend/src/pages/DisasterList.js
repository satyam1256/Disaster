import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Refresh
} from '@mui/icons-material';

import { disasterAPI } from '../services/api';
import socketService from '../services/socket';

const DisasterList = () => {
  const navigate = useNavigate();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  useEffect(() => {
    loadDisasters();
    
    // Subscribe to real-time updates
    const unsubscribe = socketService.subscribe('disaster_updated', (data) => {
      loadDisasters(); // Refresh the list
    });

    return unsubscribe;
  }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this disaster?')) {
      try {
        await disasterAPI.deleteDisaster(id);
        loadDisasters();
      } catch (err) {
        setError('Failed to delete disaster');
        console.error('Error deleting disaster:', err);
      }
    }
  };

  const filteredDisasters = disasters.filter(disaster => {
    const matchesSearch = disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disaster.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disaster.location_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = tagFilter === 'all' || 
                      disaster.tags?.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()));

    return matchesSearch && matchesTag;
  });

  const getUniqueTags = () => {
    const tags = new Set();
    disasters.forEach(disaster => {
      disaster.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Disasters
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/disasters/new')}
        >
          New Disaster
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Tag</InputLabel>
                <Select
                  value={tagFilter}
                  label="Tag"
                  onChange={(e) => setTagFilter(e.target.value)}
                >
                  <MenuItem value="all">All Tags</MenuItem>
                  {getUniqueTags().map(tag => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadDisasters}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Disasters Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200, maxWidth: 350 }}>Title</TableCell>
              <TableCell sx={{ minWidth: 150, maxWidth: 200 }}>Location</TableCell>
              <TableCell sx={{ minWidth: 150, maxWidth: 200 }}>Tags</TableCell>
              <TableCell sx={{ minWidth: 100, maxWidth: 120 }}>Created</TableCell>
              <TableCell align="center" sx={{ minWidth: 120, maxWidth: 150 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDisasters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="textSecondary" py={3}>
                    {disasters.length === 0 ? 'No disasters found' : 'No disasters match your filters'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDisasters.map((disaster) => (
                <TableRow key={disaster.id} hover>
                  <TableCell
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/disasters/${disaster.id}`)}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {disaster.title}
                    </Typography>
                    <Tooltip title={disaster.description}>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '300px',
                          wordWrap: 'break-word'
                        }}
                      >
                        {disaster.description}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                      {disaster.location_name || 'No location'}
                    </Typography>
                    {disaster.lat && disaster.lng && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        {disaster.lat.toFixed(4)}, {disaster.lng.toFixed(4)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={disaster.tags?.length > 3 ? disaster.tags.join(', ') : ''}>
                      <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ maxWidth: '180px' }}>
                        {disaster.tags?.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {disaster.tags?.length > 3 && (
                          <Chip
                            label={`+${disaster.tags.length - 3}`}
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        )}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(disaster.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/disasters/${disaster.id}`)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/disasters/${disaster.id}/edit`)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(disaster.id)}
                        title="Delete"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredDisasters.length} of {disasters.length} disasters
        </Typography>
      </Box>
    </Box>
  );
};

export default DisasterList; 