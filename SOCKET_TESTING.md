# Socket.IO Real-Time Events Testing Guide

This guide explains how to test the real-time WebSocket events in your disaster response platform.

## 🎯 What We're Testing

The backend emits these Socket.IO events:
- `disaster_updated` - When disasters are created, updated, or deleted
- `social_media_updated` - When social media data is fetched
- `resources_updated` - When resource data is fetched

## 🚀 Quick Start

### Option 1: HTML Client (Recommended for beginners)

1. **Start your backend server:**
   ```bash
   node index.js
   ```

2. **Open the HTML test client:**
   - Open `socket-test.html` in your web browser
   - You should see "Connected to Socket.IO server!" if everything is working

3. **Trigger events using Postman:**
   - Create a disaster: `POST /disasters`
   - Get social media: `GET /disasters/:id/social-media`
   - Get resources: `GET /disasters/:id/resources?lat=40.7128&lon=-74.0060`

4. **Watch for real-time events in the browser**

### Option 2: Node.js Client

1. **Start your backend server:**
   ```bash
   node index.js
   ```

2. **Run the Node.js test client:**
   ```bash
   node test-socket.js
   ```

3. **Trigger events using Postman or the test script:**
   ```bash
   node test-events.js
   ```

## 📋 Postman Test Payloads

### Create Disaster (triggers `disaster_updated`)
```http
POST http://localhost:8002/disasters
Content-Type: application/json
Authorization: Bearer test-user-1

{
  "title": "Test Disaster",
  "location_name": "New York, NY",
  "description": "Testing real-time updates",
  "tags": ["test", "flood"],
  "lat": 40.7128,
  "lng": -74.0060
}
```

### Get Social Media (triggers `social_media_updated`)
```http
GET http://localhost:8002/disasters/{disaster_id}/social-media
Authorization: Bearer test-user-1
```

### Get Resources (triggers `resources_updated`)
```http
GET http://localhost:8002/disasters/{disaster_id}/resources?lat=40.7128&lon=-74.0060
Authorization: Bearer test-user-1
```

### Update Disaster (triggers `disaster_updated`)
```http
PUT http://localhost:8002/disasters/{disaster_id}
Content-Type: application/json
Authorization: Bearer test-user-1

{
  "title": "Updated Disaster Title",
  "description": "Updated description"
}
```

### Delete Disaster (triggers `disaster_updated`)
```http
DELETE http://localhost:8002/disasters/{disaster_id}
Authorization: Bearer test-user-1
```

## 🔍 Expected Events

### disaster_updated
```json
{
  "id": "disaster-uuid",
  "title": "Test Disaster",
  "location_name": "New York, NY",
  "description": "Testing real-time updates",
  "tags": ["test", "flood"],
  "location": "POINT(-74.0060 40.7128)",
  "owner_id": "test-user-1",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### social_media_updated
```json
{
  "disaster_id": "disaster-uuid",
  "data": [
    {
      "post": "#floodrelief Need food in NYC",
      "user": "citizen1",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### resources_updated
```json
{
  "disaster_id": "disaster-uuid",
  "data": {
    "resources": [
      {
        "id": "resource-uuid",
        "name": "Emergency Shelter",
        "type": "shelter",
        "location": "POINT(-74.0060 40.7128)",
        "capacity": 100
      }
    ],
    "note": "Geospatial filtering will be implemented when resources have location data",
    "query_params": {
      "lat": "40.7128",
      "lon": "-74.0060"
    }
  }
}
```

## 🛠️ Troubleshooting

### Connection Issues
- Make sure your backend server is running on port 8002
- Check that Socket.IO is properly initialized in `index.js`
- Verify CORS settings allow your client origin

### No Events Received
- Check that the `io` instance is properly passed to controllers
- Verify that `io.emit()` calls are being executed
- Check server logs for any errors

### Authentication Issues
- The test scripts use mock authentication
- You may need to adjust the auth headers based on your implementation
- Check the `authMiddleware.js` for required format

## 📁 Files Created

- `socket-test.html` - Browser-based test client
- `test-socket.js` - Node.js test client
- `test-events.js` - Script to trigger events via API calls
- `SOCKET_TESTING.md` - This guide

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ HTML client shows "Connected to Socket.IO server!"
2. ✅ Node.js client shows "Connected to Socket.IO server!"
3. ✅ Events appear in real-time when you make API calls
4. ✅ No errors in browser console or terminal 