-- Fix for NBS Honeycomb Blind - Arena Standard
-- Currently categorized as 'Internal Blinds', causing it to show Roller Blind extras.
-- This updates it to 'Honeycomb' to match other Honeycomb products.

UPDATE products 
SET category = 'Honeycomb' 
WHERE name = 'NBS Honeycomb Blind - Arena Standard' 
AND supplier = 'NBS';
