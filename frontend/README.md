# Disaster Response Platform - Frontend

A React-based frontend for the Disaster Response Platform with real-time updates, geospatial features, and comprehensive disaster management.

## Features

### Core Functionality
- **Dashboard**: Real-time statistics and activity feed
- **Disaster Management**: Create, view, edit, and delete disasters
- **Geocoding**: Automatic location extraction from descriptions
- **Real-time Updates**: Live updates via WebSocket connections

### Reports Management (NEW)
- **Submit Reports**: Citizen reports with image attachments
- **Reports List**: View and manage all reports for a disaster
- **Verification System**: Verify, reject, or mark reports as pending
- **Filtering**: Filter reports by status and reporter
- **Real-time Updates**: Live updates when reports are submitted or verified

### Social Media Integration
- **Mock Social Media**: Simulated social media posts
- **Real-time Feeds**: Live social media updates

### Resource Management
- **Geospatial Resources**: Find resources near disaster locations
- **Resource Types**: Categorize resources (shelter, food, medical, etc.)
- **Add Resources**: Create new resources with location data

### Official Updates
- **Web Scraping**: Real-time updates from government sources
- **Multiple Sources**: FEMA, Red Cross, Ready.gov integration

### Image Verification
- **AI Verification**: Gemini API integration for image analysis
- **Disaster Context**: Verify images against disaster descriptions

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8002 (must be running)

## Usage

### Dashboard
- View disaster statistics and real-time activity
- Monitor pending reports and verification status
- Quick access to recent disasters

### Disaster Management
1. **Create Disaster**: Fill out form with title, description, location
2. **Auto-geocoding**: Location automatically extracted from description
3. **View Details**: Access social media, resources, official updates
4. **Edit/Delete**: Manage existing disasters

### Reports System
1. **Submit Report**: 
   - Navigate to "Submit Report" tab
   - Select disaster from dropdown
   - Enter content and optional image URL
   - Set verification status (default: pending)

2. **Manage Reports**:
   - Click "View All Reports" from disaster detail page
   - Filter by verification status or reporter
   - Verify/reject reports with notes
   - Delete inappropriate reports

3. **Real-time Updates**:
   - New reports appear instantly
   - Status changes update in real-time
   - Dashboard shows live statistics

### Geocoding Tool
- Test location extraction from text descriptions
- View coordinates and formatted addresses
- Debug geocoding issues

## API Integration

### Reports API Endpoints
- `POST /reports` - Create new report
- `GET /reports/disaster/:id` - Get reports for disaster
- `GET /reports/:id` - Get single report
- `PUT /reports/:id` - Update report
- `DELETE /reports/:id` - Delete report
- `PATCH /reports/:id/verify` - Verify/reject report

### Authentication
- Mock authentication with hardcoded user "netrunnerX"
- Role-based access control (admin/contributor)
- Authorization headers automatically included

### Real-time Features
- Socket.IO integration for live updates
- Automatic reconnection handling
- Event-driven UI updates

## File Structure

```
src/
├── components/
│   └── Navigation.js          # Main navigation tabs
├── pages/
│   ├── Dashboard.js           # Main dashboard with stats
│   ├── DisasterForm.js        # Create/edit disasters
│   ├── DisasterList.js        # List all disasters
│   ├── DisasterDetail.js      # Disaster details with tabs
│   ├── ReportForm.js          # Submit new reports
│   ├── ReportsList.js         # Manage reports (NEW)
│   └── GeocodingTool.js       # Test geocoding
├── services/
│   ├── api.js                 # API service functions
│   └── socket.js              # Socket.IO service
└── App.js                     # Main app with routing
```

## Testing Reports

### Submit a Test Report
1. Create a disaster first
2. Go to "Submit Report" tab
3. Fill out the form:
   ```json
   {
     "disaster_id": "1",
     "content": "Heavy flooding in downtown area. Water level rising rapidly.",
     "image_url": "https://example.com/flood-image.jpg",
     "user_id": "citizen_reporter",
     "verification_status": "pending"
   }
   ```

### Verify Reports
1. Go to disaster detail page
2. Click "Reports" tab
3. Click "View All Reports"
4. Use verification controls to approve/reject reports

### Real-time Testing
- Open multiple browser tabs
- Submit reports in one tab
- Watch updates appear in other tabs
- Check dashboard statistics update

## Troubleshooting

### Common Issues
1. **Backend Connection**: Ensure backend is running on port 8002
2. **CORS Errors**: Backend should have CORS enabled
3. **Socket Connection**: Check WebSocket connection in browser dev tools
4. **API Errors**: Verify authentication headers are being sent

### Debug Mode
- Open browser developer tools
- Check Network tab for API calls
- Monitor Console for errors
- Verify Socket.IO connection status

## Dependencies

- **React**: UI framework
- **Material-UI**: Component library
- **React Router**: Navigation
- **Axios**: HTTP client
- **Socket.IO Client**: Real-time updates
- **Date-fns**: Date utilities

## Contributing

1. Follow existing code patterns
2. Add proper error handling
3. Include loading states
4. Test real-time features
5. Update documentation
