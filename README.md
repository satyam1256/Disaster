# Disaster Response Platform

A comprehensive MERN stack disaster response platform with real-time data aggregation, geospatial queries, and AI-powered features.

## 📁 Project Structure

```
Disaster/
├── backend/           # Node.js/Express.js backend
│   ├── src/          # Backend source code
│   ├── *.sql         # Database setup files
│   ├── *.js          # Test files
│   └── README.md     # Backend documentation
├── frontend/         # React.js frontend
│   ├── src/          # Frontend source code
│   ├── public/       # Static files
│   └── README.md     # Frontend documentation
└── README.md         # This file
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
# Create .env file with your credentials
node index.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- Supabase account and project
- Gemini API key (optional, for AI features)
- Geoapify API key (optional, for geocoding)

## 🔧 Detailed Setup

See individual README files for detailed setup instructions:
- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)

## 🌟 Features

- **Real-time Disaster Management**: Live updates with Socket.IO
- **Geospatial Resource Lookup**: Location-based emergency resources
- **AI-Powered Verification**: Gemini API for image and report verification
- **Social Media Integration**: Mock Twitter API for disaster reports
- **Rate Limiting**: API protection and throttling
- **Role-based Access**: Admin and user permissions
- **Audit Trails**: Complete change tracking
- **Caching**: Redis-like caching with Supabase

## 📡 API Documentation

The backend provides RESTful APIs for:
- Disaster CRUD operations
- Social media report aggregation
- Resource management
- Geocoding services
- Image verification
- Real-time updates

See [Backend README](./backend/README.md) for complete API documentation.

## 🔒 Security

- JWT-based authentication
- Rate limiting (100 requests/15min per IP)
- Input validation and sanitization
- CORS protection
- Role-based access control

## 🛠️ Development

### Running Both Services
```bash
# Terminal 1 - Backend
cd backend
node index.js

# Terminal 2 - Frontend
cd frontend
npm start
```

### Testing
- Backend tests: See [Backend README](./backend/README.md)
- Frontend tests: `npm test` in frontend directory

## 📊 Database

Supabase PostgreSQL with geospatial extensions for:
- Disaster tracking
- Resource management
- Social media reports
- Audit trails
- Real-time subscriptions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
