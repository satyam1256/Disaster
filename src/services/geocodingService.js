const axios = require('axios');

const GEOAPIFY_API_KEY = '3fc6f043f59d4ae8b550d94ba682e1cb';
const GEOAPIFY_API_URL = 'https://api.geoapify.com/v1/geocode/search';

exports.geocodeLocation = async (locationName) => {
  const url = `${GEOAPIFY_API_URL}?text=${encodeURIComponent(locationName)}&apiKey=${GEOAPIFY_API_KEY}`;
  const { data } = await axios.get(url);
  if (data.features && data.features.length > 0) {
    const { lat, lon } = data.features[0].properties;
    return { lat, lng: lon };
  }
  return null;
}; 