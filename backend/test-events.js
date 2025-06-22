const axios = require('axios');

const BASE_URL = 'http://localhost:8002';
const TEST_DISASTER_ID = 'test-123'; // You'll need to replace this with a real disaster ID

// Mock user for testing (you may need to adjust based on your auth setup)
const mockUser = {
  id: 'test-user-1',
  role: 'admin'
};

async function testSocketIOEvents() {
  console.log('🧪 Testing Socket.IO Real-Time Events\n');
  
  try {
    // Test 1: Create a disaster (should emit disaster_updated)
    console.log('1️⃣ Testing disaster creation...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/disasters`, {
        title: 'Test Disaster - Socket.IO',
        location_name: 'Test Location',
        description: 'Testing real-time updates',
        tags: ['test', 'socket'],
        lat: 40.7128,
        lng: -74.0060
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockUser.id}` // Adjust based on your auth
        }
      });
      console.log('✅ Disaster created:', createResponse.data.id);
      
      // Test 2: Get social media (should emit social_media_updated)
      console.log('\n2️⃣ Testing social media endpoint...');
      const socialResponse = await axios.get(`${BASE_URL}/disasters/${createResponse.data.id}/social-media`, {
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        }
      });
      console.log('✅ Social media data retrieved');
      
      // Test 3: Get resources (should emit resources_updated)
      console.log('\n3️⃣ Testing resources endpoint...');
      const resourcesResponse = await axios.get(`${BASE_URL}/disasters/${createResponse.data.id}/resources?lat=40.7128&lon=-74.0060`, {
        headers: {
          'Authorization': `Bearer ${mockUser.id}`
        }
      });
      console.log('✅ Resources data retrieved');
      
      console.log('\n🎉 All tests completed! Check your Socket.IO client for real-time events.');
      
    } catch (error) {
      console.log('❌ API call failed:', error.response?.data || error.message);
      console.log('💡 Make sure your server is running and auth is properly configured');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testSocketIOEvents(); 