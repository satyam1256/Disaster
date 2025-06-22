#!/bin/bash

echo "🧪 Testing Rate Limiting Features"
echo "=================================="

BASE_URL="https://disaster-jupe.onrender.com"

echo ""
echo "1️⃣ Testing General Rate Limiting (100 requests per 15 minutes)"
echo "Making 5 rapid requests to /health endpoint..."

for i in {1..5}; do
    echo "Request $i:"
    curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" "$BASE_URL/health"
    sleep 0.1
done

echo ""
echo "2️⃣ Testing Geocoding Rate Limiting (5 requests per minute)"
echo "Making 6 rapid geocoding requests..."

for i in {1..6}; do
    echo "Geocoding request $i:"
    curl -s -X POST "$BASE_URL/geocode" \
        -H "Content-Type: application/json" \
        -d '{"description": "Flood in Manhattan, NYC"}' \
        -w "Status: %{http_code}\n"
    sleep 0.1
done

echo ""
echo "3️⃣ Testing Image Verification Rate Limiting (3 requests per minute)"
echo "Making 4 rapid image verification requests..."

# First, create a disaster to get an ID
echo "Creating a test disaster..."
DISASTER_RESPONSE=$(curl -s -X POST "$BASE_URL/disasters" \
    -H "Content-Type: application/json" \
    -H "x-user: netrunnerX" \
    -d '{
        "title": "Test Disaster for Rate Limiting",
        "location_name": "Test Location",
        "description": "Testing rate limiting",
        "tags": ["test"],
        "lat": 40.7128,
        "lng": -74.0060
    }')

DISASTER_ID=$(echo $DISASTER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Created disaster with ID: $DISASTER_ID"

for i in {1..4}; do
    echo "Image verification request $i:"
    curl -s -X POST "$BASE_URL/disasters/$DISASTER_ID/verify-image" \
        -H "Content-Type: application/json" \
        -H "x-user: netrunnerX" \
        -d '{"image_url": "https://example.com/test-image.jpg"}' \
        -w "Status: %{http_code}\n"
    sleep 0.1
done

echo ""
echo "4️⃣ Testing Admin Operations Rate Limiting (20 requests per 5 minutes)"
echo "Making 3 rapid delete requests..."

for i in {1..3}; do
    echo "Admin delete request $i:"
    curl -s -X DELETE "$BASE_URL/disasters/$DISASTER_ID" \
        -H "x-user: netrunnerX" \
        -w "Status: %{http_code}\n"
    sleep 0.1
done

echo ""
echo "✅ Rate limiting tests completed!"
echo "Check the responses above for rate limit errors (429 status codes)" 