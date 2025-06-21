# Disaster Response Platform - Backend

Node.js/Express.js backend for the Disaster Response Platform with real-time data aggregation, geospatial queries, and AI-powered features.

## 🚀 Features

- **Disaster Management**: CRUD operations with audit trails
- **Real-time Updates**: Socket.IO integration for live data
- **Geospatial Queries**: Location-based resource lookup
- **Social Media Integration**: Mock Twitter API for disaster reports
- **AI-Powered Features**: Gemini API for image verification and geocoding
- **Rate Limiting**: Request throttling for API protection
- **Caching**: Redis-like caching with Supabase
- **Authentication**: JWT-based auth with role-based access

## 📋 Prerequisites

- Node.js (v18 or higher)
- Supabase account and project
- Gemini API key (optional, for AI features)
- Geoapify API key (optional, for geocoding)

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the backend directory:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_supabase_anon_key_here
   
   # Server Configuration
   PORT=8002
   NODE_ENV=development
   
   # API Keys (optional)
   GEMINI_API_KEY=your_gemini_api_key_here
   GEOAPIFY_API_KEY=your_geoapify_api_key_here
   ```

3. **Database Setup**:
   Run the SQL files in your Supabase SQL editor:
   - `supabase_geospatial_setup.sql` - Main database schema
   - `reports_table_setup.sql` - Reports table setup
   - `test_reports_table.sql` - Test data

4. **Start the server**:
   ```bash
   npm start
   # or
   node index.js
   ```

## 📡 API Endpoints

### Disasters
- `GET /disasters` - Get all disasters
- `POST /disasters` - Create new disaster
- `GET /disasters/:id` - Get disaster by ID
- `PUT /disasters/:id` - Update disaster
- `DELETE /disasters/:id` - Delete disaster

### Reports
- `GET /reports` - Get all reports
- `POST /reports` - Create new report
- `GET /reports/:id` - Get report by ID
- `PUT /reports/:id` - Update report
- `DELETE /reports/:id` - Delete report
- `PATCH /reports/:id/verify` - Verify/reject report

### Resources
- `GET /resources/disaster/:id` - Get resources for disaster
- `POST /resources` - Create new resource
- `PUT /resources/:id` - Update resource
- `DELETE /resources/:id` - Delete resource

### Geocoding
- `POST /geocode` - Geocode location from description

### Health Check
- `GET /health` - Server health status

## 🔧 Testing

### Socket.IO Testing
```bash
node test-socket.js
```

### Rate Limiting Testing
```bash
node test-rate-limiting.js
# or
./test-rate-limiting.sh
```

### Event Testing
```bash
node test-events.js
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── *.sql               # Database setup files
├── *.js                # Test files
├── *.html              # Socket testing
├── package.json
└── index.js            # Server entry point
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Authentication**: JWT token validation
- **Role-based Access**: Admin and user roles
- **Input Validation**: Request data sanitization
- **CORS**: Cross-origin resource sharing

## 📊 Database Schema

### Disasters Table
- `id` (UUID, Primary Key)
- `title` (text)
- `location_name` (text)
- `location` (geometry)
- `description` (text)
- `tags` (text array)
- `owner_id` (text)
- `audit_trail` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Reports Table
- `id` (UUID, Primary Key)
- `disaster_id` (UUID, Foreign Key)
- `reporter_name` (text)
- `content` (text)
- `location` (geometry)
- `verification_status` (text)
- `source` (text)
- `created_at` (timestamp)

### Resources Table
- `id` (UUID, Primary Key)
- `disaster_id` (UUID, Foreign Key)
- `name` (text)
- `type` (text)
- `location` (geometry)
- `capacity` (integer)
- `contact_info` (text)
- `description` (text)
- `created_at` (timestamp)

## 🚨 Rate Limits

- **General**: 100 requests per 15 minutes
- **Geocoding**: 50 requests per 15 minutes
- **Image Verification**: 20 requests per 15 minutes
- **Admin Operations**: 200 requests per 15 minutes

## 🔗 External APIs

- **Supabase**: Database and real-time features
- **Gemini API**: AI-powered image verification and geocoding
- **Geoapify**: Geocoding service
- **Mock Twitter**: Social media reports simulation 