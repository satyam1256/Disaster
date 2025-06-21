# Report API Documentation

The Report API provides comprehensive CRUD operations for social media reports related to disasters. This API allows users to create, read, update, delete, and verify reports with real-time updates via WebSocket.

## Table of Contents
- [Setup](#setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Rate Limiting](#rate-limiting)
- [Real-time Updates](#real-time-updates)
- [Testing](#testing)
- [Error Handling](#error-handling)

## Setup

### 1. Database Setup
Run the SQL script to create the reports table:

```sql
-- Execute reports_table_setup.sql in your Supabase SQL editor
```

### 2. Server Setup
The report routes are automatically included in the main server. No additional setup required.

## Authentication

All report endpoints require authentication. Use the following tokens:

- **Admin User**: `netrunnerX` (full access)
- **Contributor User**: `reliefAdmin` (limited access)

Include the token in the Authorization header:
```
Authorization: Bearer netrunnerX
```

## API Endpoints

### 1. Create Report
**POST** `/reports`

Create a new social media report for a disaster.

**Request Body:**
```json
{
  "disaster_id": 1,
  "content": "Flood waters rising rapidly in downtown area.",
  "image_url": "https://example.com/flood1.jpg",
  "user": "citizen_reporter",
  "urgency": "high"
}
```

**Required Fields:**
- `disaster_id`: ID of the disaster (integer)
- `content`: Report content (string)
- `user`: Username of the reporter (string)

**Optional Fields:**
- `image_url`: URL to an image (string)
- `urgency`: Urgency level - "low", "medium", "high" (default: "medium")

**Response:**
```json
{
  "id": 1,
  "disaster_id": 1,
  "content": "Flood waters rising rapidly in downtown area.",
  "image_url": "https://example.com/flood1.jpg",
  "user": "citizen_reporter",
  "urgency": "high",
  "verified": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 2. Get Reports for Disaster
**GET** `/reports/disaster/:disaster_id`

Retrieve all reports for a specific disaster.

**Query Parameters:**
- `verified`: Filter by verification status (true/false)
- `urgency`: Filter by urgency level (low/medium/high)
- `limit`: Number of reports to return (default: 50)
- `offset`: Number of reports to skip (default: 0)

**Example:**
```
GET /reports/disaster/1?verified=false&urgency=high&limit=10&offset=0
```

**Response:**
```json
{
  "reports": [
    {
      "id": 1,
      "disaster_id": 1,
      "content": "Flood waters rising rapidly...",
      "user": "citizen_reporter",
      "urgency": "high",
      "verified": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "disaster_id": 1,
  "filters": {
    "verified": "false",
    "urgency": "high",
    "limit": "10",
    "offset": "0"
  }
}
```

### 3. Get Report Statistics
**GET** `/reports/disaster/:disaster_id/stats`

Get statistics for reports of a specific disaster.

**Response:**
```json
{
  "total": 15,
  "verified": 8,
  "unverified": 7,
  "urgency": {
    "low": 3,
    "medium": 7,
    "high": 5
  },
  "recent": 3
}
```

### 4. Get Single Report
**GET** `/reports/:id`

Retrieve a single report by ID.

**Response:**
```json
{
  "id": 1,
  "disaster_id": 1,
  "content": "Flood waters rising rapidly...",
  "image_url": "https://example.com/flood1.jpg",
  "user": "citizen_reporter",
  "urgency": "high",
  "verified": false,
  "verification_notes": null,
  "verified_by": null,
  "verified_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 5. Update Report
**PUT** `/reports/:id`

Update an existing report.

**Request Body:**
```json
{
  "content": "Updated: Flood waters continue to rise.",
  "urgency": "high",
  "image_url": "https://example.com/flood_updated.jpg"
}
```

**Response:** Updated report object

### 6. Verify Report (Admin Only)
**PATCH** `/reports/:id/verify`

Verify or unverify a report (admin function).

**Request Body:**
```json
{
  "verified": true,
  "verification_notes": "Confirmed by emergency services on scene."
}
```

**Response:** Updated report object with verification details

### 7. Delete Report (Admin Only)
**DELETE** `/reports/:id`

Delete a report (admin only).

**Response:** 204 No Content

## Rate Limiting

Report endpoints have the following rate limits:

- **Create/Update/Delete/Verify**: 10 requests per 5 minutes per IP
- **Read operations**: 100 requests per 15 minutes per IP (general limit)

When rate limited, you'll receive:
```json
{
  "error": "Too many report submissions, please try again later.",
  "retryAfter": "5 minutes"
}
```

## Real-time Updates

The Report API emits real-time updates via WebSocket for the following events:

### Socket Events

1. **social_media_updated**
   - Emitted when a report is created, updated, verified, or deleted
   - Payload includes disaster_id, report data, and action type

**Example Socket Event:**
```javascript
// Listen for report updates
socket.on('social_media_updated', (data) => {
  console.log('Report updated:', data);
  // data = {
  //   disaster_id: 1,
  //   data: { /* report object */ },
  //   action: 'created' | 'updated' | 'verified' | 'deleted'
  // }
});
```

## Testing

### 1. Postman Collection
Import the `Report-API-Tests.postman_collection.json` file into Postman for comprehensive testing.

### 2. Manual Testing
Use the provided test payloads in the Postman collection or test with curl:

```bash
# Create a report
curl -X POST http://localhost:8002/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer netrunnerX" \
  -d '{
    "disaster_id": 1,
    "content": "Test report",
    "user": "test_user",
    "urgency": "medium"
  }'

# Get reports for disaster
curl -X GET http://localhost:8002/reports/disaster/1 \
  -H "Authorization: Bearer netrunnerX"
```

### 3. Rate Limiting Test
```bash
# Test rate limiting by making multiple requests quickly
for i in {1..15}; do
  curl -X POST http://localhost:8002/reports \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer netrunnerX" \
    -d '{
      "disaster_id": 1,
      "content": "Rate limit test '$i'",
      "user": "test_user"
    }'
  echo "Request $i completed"
done
```

## Error Handling

### Common Error Responses

1. **400 Bad Request**
   ```json
   {
     "error": "disaster_id, content, and user are required"
   }
   ```

2. **404 Not Found**
   ```json
   {
     "error": "Report not found"
   }
   ```

3. **429 Too Many Requests**
   ```json
   {
     "error": "Too many report submissions, please try again later.",
     "retryAfter": "5 minutes"
   }
   ```

4. **500 Internal Server Error**
   ```json
   {
     "error": "Database connection failed"
   }
   ```

### Validation Rules

- `disaster_id` must exist in the disasters table
- `urgency` must be one of: "low", "medium", "high"
- `content` cannot be empty
- `user` cannot be empty
- `image_url` must be a valid URL (if provided)

## Database Schema

```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    disaster_id INTEGER NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    user VARCHAR(255) NOT NULL,
    urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Features

- **Authentication Required**: All endpoints require valid authentication
- **Role-based Access**: Admin users can verify and delete any report
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: Comprehensive validation of all inputs
- **SQL Injection Protection**: Using parameterized queries via Supabase
- **CORS Enabled**: Configured for cross-origin requests

## Integration with Frontend

The Report API integrates seamlessly with the React frontend:

1. **ReportForm Component**: Uses POST `/reports` to create new reports
2. **DisasterDetail Component**: Uses GET `/reports/disaster/:id` to display reports
3. **Real-time Updates**: Frontend listens to `social_media_updated` socket events
4. **Admin Functions**: Admin users can verify and delete reports through the UI

## Monitoring and Logging

The API includes comprehensive logging:

- **Request Logging**: All API requests are logged
- **Error Logging**: Detailed error logs with stack traces
- **Performance Monitoring**: Response times and database query performance
- **Rate Limit Monitoring**: Track rate limit violations

## Future Enhancements

Potential improvements for the Report API:

1. **Image Upload**: Direct image upload to cloud storage
2. **Report Categories**: Categorize reports (damage, evacuation, resources, etc.)
3. **Geolocation**: Add location data to reports
4. **Report Analytics**: Advanced analytics and reporting
5. **Bulk Operations**: Bulk verify/delete reports
6. **Report Templates**: Predefined report templates for common scenarios 