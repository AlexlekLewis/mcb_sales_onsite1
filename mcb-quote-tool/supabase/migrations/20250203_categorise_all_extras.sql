-- Migration: Categorise remaining extras for all product ranges

-- 1. Curtains
UPDATE product_extras SET extra_category = 'Options' WHERE product_category = 'Curtains' AND name LIKE 'Sewn in Lining%';

-- 2. Honeycomb Blinds
UPDATE product_extras SET extra_category = 'Motorisation' WHERE product_category = 'Honeycomb Blinds' AND (name LIKE '%Motor%' OR name LIKE '%Remote%' OR name LIKE '%Hub%' OR name LIKE '%Power%' OR name LIKE '%Charging%');
UPDATE product_extras SET extra_category = 'Hardware' WHERE product_category = 'Honeycomb Blinds' AND (name LIKE '%Guides%' OR name LIKE '%Extension%');
UPDATE product_extras SET extra_category = 'Options' WHERE product_category = 'Honeycomb Blinds' AND name = 'Cordless Operation';

-- 3. Internal Blinds (NBS & Others)
UPDATE product_extras SET extra_category = 'Motorisation' WHERE product_category = 'Internal Blinds' AND (name LIKE '%Motor%' OR name LIKE '%Remote%' OR name LIKE '%RTS%');
UPDATE product_extras SET extra_category = 'Pelmets & Valances' WHERE product_category = 'Internal Blinds' AND name LIKE '%Pelmet%';
-- Catch-all for basic options already set (if any are missed)

-- 4. Plantation Shutters
UPDATE product_extras SET extra_category = 'Hardware' WHERE product_category = 'Plantation Shutters' AND name LIKE '%Hinges%';

-- 5. Roller Blinds
UPDATE product_extras SET extra_category = 'Hardware' WHERE product_category = 'Roller Blinds' AND (name LIKE '%Adaptors%' OR name LIKE '%Brackets%' OR name LIKE '%Mechanism%' OR name LIKE '%Pin End%' OR name LIKE '%Spline%');
-- Note: Many Roller Blind extras were already handled in the previous migration, but 'General' ones might remain.

-- 6. Security Doors
UPDATE product_extras SET extra_category = 'Installation' WHERE product_category = 'Security Doors' AND (name = 'Installation' OR name LIKE '%Measure Fee%');
UPDATE product_extras SET extra_category = 'Locks & Hardware' WHERE product_category = 'Security Doors' AND (name LIKE '%Lock%' OR name LIKE '%Cylinder%' OR name LIKE '%Bug Strip%' OR name LIKE '%Closer%' OR name LIKE '%Hinges%' OR name LIKE '%Patio Bolt%' OR name LIKE '%Roller Wheel%' OR name LIKE '%Snib%');
UPDATE product_extras SET extra_category = 'Mesh & Options' WHERE product_category = 'Security Doors' AND (name LIKE '%Mesh%' OR name LIKE '%Pet Door%' OR name LIKE '%Vision-Gard%' OR name LIKE '%TuffScreen%' OR name LIKE '%DVA%');
UPDATE product_extras SET extra_category = 'Frame & Structure' WHERE product_category = 'Security Doors' AND (name LIKE '%Frame%' OR name LIKE '%Jamb%' OR name LIKE '%Build Out%' OR name LIKE '%Track%');
UPDATE product_extras SET extra_category = 'Services' WHERE product_category = 'Security Doors' AND (name LIKE '%Cut Down%' OR name LIKE '%Remesh%' OR name LIKE '%Powder Coat%' OR name LIKE '%Non-Standard Colour%');

-- 7. Venetian Blinds
UPDATE product_extras SET extra_category = 'Hardware' WHERE product_category = 'Venetian Blinds' AND (name LIKE '%Brackets%' OR name LIKE '%Clips%' OR name LIKE '%Cutouts%' OR name LIKE '%Tape%');
UPDATE product_extras SET extra_category = 'Options' WHERE product_category = 'Venetian Blinds' AND (name LIKE '%Colours%' OR name LIKE '%Stripes%');

-- 8. General Catch-all
-- Ensure any remaining 'General' are reasonably sane, or manually review later.
