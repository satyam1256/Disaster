const axios = require('axios');

const BASE_URL = 'http://localhost:8002';

// Helper function to make requests and show results
async function makeRequest(name, requestFn) {
  try {
    const start = Date.now();
    const response = await requestFn();
    const duration = Date.now() - start;
    
    console.log(`✅ ${name}:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Duration: ${duration}ms`);
    
    // Check for rate limit headers
    if (response.headers['ratelimit-remaining']) {
      console.log(`   Rate Limit Remaining: ${response.headers['ratelimit-remaining']}`);
    }
    if (response.headers['ratelimit-reset']) {
      console.log(`   Rate Limit Reset: ${response.headers['ratelimit-reset']}`);
    }
    
    return response;
  } catch (error) {
    console.log(`❌ ${name}:`);
    console.log(`   Status: ${error.response?.status || 'Network Error'}`);
    if (error.response?.data) {
      console.log(`   Error: ${JSON.stringify(error.response.data)}`);
    }
    return error.response;
  }
}

async function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting Features');
  console.log('==================================\n');

  // Test 1: General Rate Limiting
  console.log('1️⃣ Testing General Rate Limiting (100 requests per 15 minutes)');
  console.log('Making 5 rapid requests to /health endpoint...\n');
  
  for (let i = 1; i <= 5; i++) {
    await makeRequest(`Health Check ${i}`, () => 
      axios.get(`${BASE_URL}/health`)
    );
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Test 2: Geocoding Rate Limiting
  console.log('\n2️⃣ Testing Geocoding Rate Limiting (5 requests per minute)');
  console.log('Making 6 rapid geocoding requests...\n');
  
  for (let i = 1; i <= 6; i++) {
    await makeRequest(`Geocoding ${i}`, () => 
      axios.post(`${BASE_URL}/geocode`, {
        description: `Flood in Manhattan, NYC - Test ${i}`
      })
    );
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Test 3: Image Verification Rate Limiting
  console.log('\n3️⃣ Testing Image Verification Rate Limiting (3 requests per minute)');
  console.log('Making 4 rapid image verification requests...\n');
  
  // First create a disaster
  console.log('Creating a test disaster...');
  const disasterResponse = await makeRequest('Create Disaster', () => 
    axios.post(`${BASE_URL}/disasters`, {
      title: 'Test Disaster for Rate Limiting',
      location_name: 'Test Location',
      description: 'Testing rate limiting',
      tags: ['test'],
      lat: 40.7128,
      lng: -74.0060
    }, {
      headers: { 'x-user': 'netrunnerX' }
    })
  );
  
  let disasterId = null;
  if (disasterResponse?.data?.id) {
    disasterId = disasterResponse.data.id;
    console.log(`Created disaster with ID: ${disasterId}\n`);
    
    for (let i = 1; i <= 4; i++) {
      await makeRequest(`Image Verification ${i}`, () => 
        axios.post(`${BASE_URL}/disasters/${disasterId}/verify-image`, {
          image_url: `https://example.com/test-image-${i}.jpg`
        }, {
          headers: { 'x-user': 'netrunnerX' }
        })
      );
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Test 4: Admin Operations Rate Limiting
  console.log('\n4️⃣ Testing Admin Operations Rate Limiting (20 requests per 5 minutes)');
  console.log('Making 3 rapid delete requests...\n');
  
  if (disasterId) {
    for (let i = 1; i <= 3; i++) {
      await makeRequest(`Admin Delete ${i}`, () => 
        axios.delete(`${BASE_URL}/disasters/${disasterId}`, {
          headers: { 'x-user': 'netrunnerX' }
        })
      );
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n✅ Rate limiting tests completed!');
  console.log('📊 Expected Results:');
  console.log('   - First few requests: 200 OK');
  console.log('   - Rate limited requests: 429 Too Many Requests');
  console.log('   - Check for RateLimit-* headers in successful responses');
}

// Run the test
testRateLimiting().catch(console.error); 