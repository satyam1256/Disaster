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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Delete,
  CheckCircle,
  Refresh,
  FilterList,
  Visibility,
  Verified,
  Pending,
  Block,
  Add
} from '@mui/icons-material';

import { reportAPI, disasterAPI } from '../services/api';
import socketService from '../services/socket';

const ReportsList = () => {
  const { disasterId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('verified');
  const [filters, setFilters] = useState({
    verification_status: '',
    user_id: ''
  });

  useEffect(() => {
    loadReports();
    // Subscribe to real-time updates
    const unsubscribeReports = socketService.subscribe('reports_updated', () => {
      loadReports();
    });
    return () => {
      unsubscribeReports();
    };
  }, [disasterId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      let response;
      if (disasterId) {
        response = await reportAPI.getReports(disasterId, filters);
      } else {
        response = await reportAPI.getAllReports(filters);
      }
      setReports(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    loadReports();
  };

  const handleVerifyReport = async () => {
    if (!selectedReport) return;
    try {
      await reportAPI.verifyReport(selectedReport.id, {
        verification_status: verificationStatus,
        verification_note: verificationNote
      });
      setShowVerifyDialog(false);
      setSelectedReport(null);
      setVerificationNote('');
      setVerificationStatus('verified');
      loadReports();
    } catch (err) {
      setError('Failed to verify report');
      console.error('Error verifying report:', err);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    try {
      await reportAPI.deleteReport(selectedReport.id);
      setShowDeleteDialog(false);
      setSelectedReport(null);
      loadReports();
    } catch (err) {
      setError('Failed to delete report');
      console.error('Error deleting report:', err);
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getVerificationStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <Verified />;
      case 'rejected': return <Block />;
      case 'pending': return <Pending />;
      default: return <Pending />;
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
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h4" component="h1">
          Reports
        </Typography>
        <Box ml="auto">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/reports/new')}
          >
            Add New Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadReports}
            sx={{ ml: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Verification Status</InputLabel>
                <Select
                  value={filters.verification_status}
                  label="Verification Status"
                  onChange={(e) => handleFilterChange('verification_status', e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User ID"
                value={filters.user_id}
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                placeholder="Filter by reporter"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reporter</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {report.user_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {report.content.length > 100 
                      ? `${report.content.substring(0, 100)}...` 
                      : report.content
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  {report.image_url ? (
                    <Tooltip title="View Image">
                      <IconButton 
                        size="small"
                        onClick={() => window.open(report.image_url, '_blank')}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No image
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getVerificationStatusIcon(report.verification_status)}
                    label={report.verification_status}
                    color={getVerificationStatusColor(report.verification_status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(report.created_at).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Update">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/reports/${report.id}/edit`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Verify/Reject">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedReport(report);
                          setVerificationStatus(report.verification_status);
                          setVerificationNote(report.verification_note || '');
                          setShowVerifyDialog(true);
                        }}
                      >
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onClose={() => setShowVerifyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Verify Report</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Reporter: {selectedReport?.user_id}
            </Typography>
            <Typography variant="body1" paragraph>
              {selectedReport?.content}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Verification Status</InputLabel>
                <Select
                  value={verificationStatus}
                  label="Verification Status"
                  onChange={(e) => setVerificationStatus(e.target.value)}
                >
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Verification Note"
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                multiline
                rows={3}
                placeholder="Add a note about the verification decision..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
          <Button onClick={handleVerifyReport} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this report? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteReport} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsList; 