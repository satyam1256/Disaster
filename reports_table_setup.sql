-- Drop the table if it exists to recreate with correct schema
DROP TABLE IF EXISTS reports CASCADE;

-- Create reports table for social media reports
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    disaster_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reports_disaster_id ON reports(disaster_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_verification_status ON reports(verification_status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Add foreign key constraint if disasters table exists
-- Uncomment the following line if your disasters table exists and has UUID id
-- ALTER TABLE reports ADD CONSTRAINT fk_reports_disaster_id FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE;

-- Insert sample reports data (optional - uncomment to add sample data)
-- Note: Replace the UUIDs with actual disaster IDs from your disasters table
/*
INSERT INTO reports (disaster_id, user_id, content, image_url, verification_status) VALUES
('15376ea1-0fd8-49d6-b32a-df36ed3912fd', 'citizen_reporter', 'Flood waters rising rapidly in downtown area. Multiple cars stranded on Main Street.', 'https://example.com/flood1.jpg', 'pending'),
('15376ea1-0fd8-49d6-b32a-df36ed3912fd', 'local_news', 'Emergency services responding to multiple calls in the affected area.', 'https://example.com/emergency1.jpg', 'verified'),
('15376ea1-0fd8-49d6-b32a-df36ed3912fd', 'power_company', 'Power outage reported in several neighborhoods. Stay safe everyone!', NULL, 'verified');
*/ 