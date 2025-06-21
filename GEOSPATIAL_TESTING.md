# Geospatial Query Testing Guide

This guide explains how to test the geospatial functionality using Supabase/PostgreSQL with ST_DWithin for finding resources within a specified radius.

## 🎯 What We've Implemented

### ✅ **Geospatial Features:**
- **ST_DWithin** queries to find resources within specified radius (default 10km)
- **ST_Distance** calculations to show distance from user location
- **PostGIS** integration with Supabase
- **Geospatial indexes** for efficient spatial queries
- **Fallback mechanism** when PostGIS functions aren't available

### 🗄️ **Database Setup Required:**

Run the SQL in `supabase_geospatial_setup.sql` in your Supabase SQL editor to:
1. Enable PostGIS extension
2. Create resources table with geospatial support
3. Create geospatial indexes
4. Create RPC function `get_resources_within_radius`
5. Set up triggers and permissions

## 🚀 Quick Start

### 1. **Setup Database (One-time)**
```sql
-- Run supabase_geospatial_setup.sql in Supabase SQL editor
```

### 2. **Test Geospatial Queries**

#### **Get Resources Within Radius**
```http
GET /resources/disaster/{disaster_id}?lat=40.7128&lon=-74.0060&radius=10
Authorization: Bearer test-user-1
```

#### **Get Resources by Type Within Radius**
```http
GET /resources/disaster/{disaster_id}/type?type=shelter&lat=40.7128&lon=-74.0060&radius=5
Authorization: Bearer test-user-1
```

#### **Create a Resource**
```http
POST /resources
Authorization: Bearer test-user-1
Content-Type: application/json

{
  "disaster_id": "your-disaster-uuid",
  "name": "Central Park Emergency Shelter",
  "type": "shelter",
  "lat": 40.7829,
  "lng": -73.9712,
  "capacity": 500,
  "contact_info": {
    "phone": "+1-555-0123",
    "email": "shelter@example.com"
  },
  "description": "Emergency shelter in Central Park"
}
```

## 📋 Test Scenarios

### **Scenario 1: Resources Within 10km of NYC**
```http
GET /resources/disaster/{disaster_id}?lat=40.7128&lon=-74.0060&radius=10
```

**Expected Response:**
```json
{
  "resources": [
    {
      "id": "resource-uuid",
      "disaster_id": "disaster-uuid",
      "name": "Central Park Emergency Shelter",
      "type": "shelter",
      "location": "POINT(-73.9712 40.7829)",
      "capacity": 500,
      "available": true,
      "contact_info": {
        "phone": "+1-555-0123",
        "email": "shelter@example.com"
      },
      "description": "Emergency shelter in Central Park",
      "distance_km": 2.5,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "query_params": {
    "lat": "40.7128",
    "lon": "-74.0060",
    "radius": "10"
  },
  "geospatial_status": "active",
  "total_found": 1
}
```

### **Scenario 2: Medical Resources Within 5km**
```http
GET /resources/disaster/{disaster_id}/type?type=medical&lat=40.7128&lon=-74.0060&radius=5
```

### **Scenario 3: Fallback When PostGIS Not Available**
If the RPC function fails, you'll get:
```json
{
  "resources": [...],
  "note": "Geospatial filtering not available - showing all available resources",
  "query_params": {
    "lat": "40.7128",
    "lon": "-74.0060",
    "radius": "10"
  },
  "geospatial_status": "fallback"
}
```

## 🗺️ Sample Test Coordinates

### **New York City Area:**
- **Manhattan Center:** `lat=40.7505, lon=-73.9352`
- **Central Park:** `lat=40.7829, lon=-73.9712`
- **Brooklyn:** `lat=40.6782, lon=-73.9352`
- **Queens:** `lat=40.7282, lon=-73.7949`

### **Sample Resources to Create:**
```json
[
  {
    "name": "Central Park Emergency Shelter",
    "type": "shelter",
    "lat": 40.7829,
    "lng": -73.9712,
    "capacity": 500
  },
  {
    "name": "Manhattan Medical Center",
    "type": "medical",
    "lat": 40.7505,
    "lng": -73.9352,
    "capacity": 200
  },
  {
    "name": "Brooklyn Food Distribution",
    "type": "food",
    "lat": 40.6782,
    "lng": -73.9352,
    "capacity": 1000
  },
  {
    "name": "Queens Water Station",
    "type": "water",
    "lat": 40.7282,
    "lng": -73.7949,
    "capacity": 5000
  }
]
```

## 🔧 PostgreSQL RPC Function Details

The `get_resources_within_radius` function uses:
- **ST_DWithin**: Finds resources within specified radius
- **ST_Distance**: Calculates distance from user location
- **ST_GeomFromText**: Converts WKT to geometry
- **ST_AsText**: Converts geometry back to WKT for response

```sql
ST_DWithin(
    r.location::geography,
    ST_GeomFromText(user_location_param, 4326)::geography,
    radius_km_param * 1000 -- Convert km to meters
)
```

## 🛠️ Troubleshooting

### **RPC Function Not Found**
- Run the SQL setup script in Supabase
- Check that PostGIS extension is enabled
- Verify function permissions

### **No Results Returned**
- Check if resources exist for the disaster_id
- Verify coordinates are in WGS84 format (lat/lon)
- Try increasing the radius parameter

### **Performance Issues**
- Ensure geospatial indexes are created
- Check that resources table has location data
- Monitor query execution time

## 🎉 Success Indicators

You'll know geospatial queries are working when:
1. ✅ Resources are returned with `distance_km` field
2. ✅ `geospatial_status` shows "active"
3. ✅ Results are ordered by distance (closest first)
4. ✅ Only resources within the specified radius are returned
5. ✅ Socket.IO events are emitted with geospatial data

## 📊 Performance Notes

- **Geospatial indexes** make queries efficient
- **ST_DWithin** is faster than ST_Distance for filtering
- **Geography type** provides accurate distance calculations
- **10km radius** is a good default for disaster response scenarios 