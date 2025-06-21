-- Supabase Geospatial Setup for Disaster Response Platform
-- Run this in your Supabase SQL editor

-- Enable PostGIS extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create or update resources table with geospatial support
CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'shelter', 'medical', 'food', 'water', 'transport'
    location GEOMETRY(POINT, 4326), -- WGS84 coordinates
    capacity INTEGER,
    available BOOLEAN DEFAULT true,
    contact_info JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create geospatial index for efficient spatial queries
CREATE INDEX IF NOT EXISTS idx_resources_location ON resources USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_resources_disaster_id ON resources (disaster_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources (type);

-- Create RPC function for geospatial queries
CREATE OR REPLACE FUNCTION get_resources_within_radius(
    disaster_id_param UUID,
    user_location_param TEXT,
    radius_km_param NUMERIC DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    disaster_id UUID,
    name TEXT,
    type TEXT,
    location TEXT,
    capacity INTEGER,
    available BOOLEAN,
    contact_info JSONB,
    description TEXT,
    distance_km NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.disaster_id,
        r.name,
        r.type,
        ST_AsText(r.location) as location,
        r.capacity,
        r.available,
        r.contact_info,
        r.description,
        ST_Distance(
            r.location::geography,
            ST_GeomFromText(user_location_param, 4326)::geography
        ) / 1000 as distance_km, -- Convert meters to kilometers
        r.created_at,
        r.updated_at
    FROM resources r
    WHERE r.disaster_id = disaster_id_param
    AND r.available = true
    AND ST_DWithin(
        r.location::geography,
        ST_GeomFromText(user_location_param, 4326)::geography,
        radius_km_param * 1000 -- Convert km to meters
    )
    ORDER BY distance_km ASC;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for resources table
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (uncomment and replace disaster_id with actual UUID from your disasters table)
-- INSERT INTO resources (disaster_id, name, type, location, capacity, contact_info, description) VALUES
-- ('your-disaster-uuid-here', 'Central Park Emergency Shelter', 'shelter', ST_GeomFromText('POINT(-73.9712 40.7829)', 4326), 500, '{"phone": "+1-555-0123", "email": "shelter@example.com"}', 'Emergency shelter in Central Park'),
-- ('your-disaster-uuid-here', 'Manhattan Medical Center', 'medical', ST_GeomFromText('POINT(-73.9352 40.7505)', 4326), 200, '{"phone": "+1-555-0124", "email": "medical@example.com"}', 'Emergency medical facility'),
-- ('your-disaster-uuid-here', 'Brooklyn Food Distribution', 'food', ST_GeomFromText('POINT(-73.9352 40.6782)', 4326), 1000, '{"phone": "+1-555-0125", "email": "food@example.com"}', 'Food distribution center'),
-- ('your-disaster-uuid-here', 'Queens Water Station', 'water', ST_GeomFromText('POINT(-73.7949 40.7282)', 4326), 5000, '{"phone": "+1-555-0126", "email": "water@example.com"}', 'Water distribution station');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON resources TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_resources_within_radius TO anon, authenticated;

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON resources FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated insert" ON resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated update" ON resources FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated delete" ON resources FOR DELETE USING (auth.role() = 'authenticated'); 