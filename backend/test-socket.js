const { io } = require("socket.io-client");

console.log('🚀 Starting Socket.IO test client...');
console.log('Connecting to https://disaster-jupe.onrender.com...\n');

const socket = io("https://disaster-jupe.onrender.com");

// Connection events
socket.on("connect", () => {
  console.log('✅ Connected to Socket.IO server!');
  console.log('📡 Listening for real-time events...\n');
  console.log('💡 To test, use Postman or your API client to:');
  console.log('   • Create/Update/Delete disasters (triggers disaster_updated)');
  console.log('   • GET /disasters/:id/social-media (triggers social_media_updated)');
  console.log('   • GET /disasters/:id/resources (triggers resources_updated)\n');
});

socket.on("disconnect", () => {
  console.log('❌ Disconnected from server');
});

socket.on("connect_error", (error) => {
  console.log('❌ Connection error:', error.message);
  console.log('💡 Make sure your backend server is running on port 8002');
});

// Real-time event listeners
socket.on("disaster_updated", (data) => {
  console.log('🔥 disaster_updated event received:');
  console.log(JSON.stringify(data, null, 2));
  console.log('─'.repeat(50));
});

socket.on("social_media_updated", (data) => {
  console.log('📱 social_media_updated event received:');
  console.log(JSON.stringify(data, null, 2));
  console.log('─'.repeat(50));
});

socket.on("resources_updated", (data) => {
  console.log('🏥 resources_updated event received:');
  console.log(JSON.stringify(data, null, 2));
  console.log('─'.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting from Socket.IO server...');
  socket.disconnect();
  process.exit(0);
});

console.log('Press Ctrl+C to exit\n'); 