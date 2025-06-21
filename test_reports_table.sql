-- Test script to verify reports table structure and functionality

-- 1. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
ORDER BY ordinal_position;

-- 2. Test data insertion
INSERT INTO reports (disaster_id, user_id, content, image_url, verification_status) 
VALUES (
    '15376ea1-0fd8-49d6-b32a-df36ed3912fd', 
    'citizen_reporter', 
    'Test report content', 
    'https://example.com/test.jpg', 
    'pending'
);

-- 3. Verify the inserted data
SELECT * FROM reports WHERE user_id = 'citizen_reporter';

-- 4. Test different user_id values
INSERT INTO reports (disaster_id, user_id, content, verification_status) 
VALUES (
    '15376ea1-0fd8-49d6-b32a-df36ed3912fd', 
    'test_user_123', 
    'Another test report', 
    'pending'
);

-- 5. Show all reports
SELECT * FROM reports ORDER BY created_at DESC; 