// Disaster model schema (for reference/validation)
module.exports = {
  id: 'string', // UUID
  title: 'string',
  location_name: 'string',
  lat: 'number',
  lng: 'number',
  description: 'string',
  tags: ['string'],
  owner_id: 'string',
  created_at: 'string',
  updated_at: 'string',
}; 