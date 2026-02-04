-- Migration: Archive Duplicate Creative Internal Blinds
-- Date: 2025-02-03

-- 1. Archive the INCORRECT product (Creative Internal Blinds)
-- ID: 48b94029-63d5-403f-99b9-79725178f216
UPDATE products 
SET is_active = false, 
    name = 'Creative Internal Blinds (Legacy/Archived)' 
WHERE id = '48b94029-63d5-403f-99b9-79725178f216';

-- 2. Rename the CORRECT product (Creative Roller Blind - Internal) to the standard name
-- ID: 0e5efdd1-fcc7-4b5a-96e8-f040386a41c7
UPDATE products 
SET name = 'Creative Internal Blinds' 
WHERE id = '0e5efdd1-fcc7-4b5a-96e8-f040386a41c7';

-- 3. Check for NBS Roller duplicates (Correction based on findings)
-- Based on previous logic, we might need to check NBS duplicates too, but prioritizing Creative as per user request.
