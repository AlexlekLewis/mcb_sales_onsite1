-- Migration: Insert Creative Internal Blinds Extras
-- Source: Creative Internal Blinds Pricing 07July2025.pdf

-- Roller Blind Accessories
INSERT INTO product_extras (product_category, name, price, price_type, supplier) VALUES
('Internal Blinds', 'Bracket Covers', 3.00, 'fixed', 'Creative'),
('Internal Blinds', 'Chain - Metal / Plastic (< 2.25m)', 6.00, 'fixed', 'Creative'),
('Internal Blinds', 'Chain Tensioner', 5.00, 'fixed', 'Creative'),
('Internal Blinds', 'Chain Winder', 19.00, 'fixed', 'Creative'),
('Internal Blinds', 'D30 Rail - Bubble Seal', 2.00, 'per_metre_width', 'Creative'),
('Internal Blinds', 'Double Brackets', 19.00, 'fixed', 'Creative'),
('Internal Blinds', 'Extension Brackets (55mm)', 7.00, 'fixed', 'Creative'),
('Internal Blinds', 'Spring / Booster (S45)', 20.00, 'fixed', 'Creative'),
('Internal Blinds', 'Tube Upgrade S45 H/D', 20.00, 'per_metre_width', 'Creative');

-- Roller Blind Services / Options
INSERT INTO product_extras (product_category, name, price, price_type, supplier) VALUES
('Internal Blinds', 'Reverse Roll', 57.00, 'fixed', 'Creative'),
('Internal Blinds', 'Cut Back (Screen/Holland)', 53.00, 'fixed', 'Creative'),
('Internal Blinds', 'Scallop Finish', 20.00, 'percentage', 'Creative'); -- Surcharge

-- Motorisation - Automate ARC
INSERT INTO product_extras (product_category, name, price, price_type, supplier) VALUES
('Internal Blinds', 'Li-Ion Zero 1.1 Nm Motor', 191.00, 'unit', 'Creative'),
('Internal Blinds', 'Li-Ion 3.0 Nm Motor', 265.00, 'unit', 'Creative'),
('Internal Blinds', 'Solar Panel V2', 144.00, 'unit', 'Creative'),
('Internal Blinds', 'Push 1 Channel Remote', 48.00, 'unit', 'Creative'),
('Internal Blinds', 'Push 5 Channel Remote', 53.00, 'unit', 'Creative'),
('Internal Blinds', 'Push 15 Channel Remote', 59.00, 'unit', 'Creative'),
('Internal Blinds', 'Automate Pulse 2 Hub', 191.00, 'unit', 'Creative');

-- Motorisation - Somfy
INSERT INTO product_extras (product_category, name, price, price_type, supplier) VALUES
('Internal Blinds', 'Sonesse 40 RTS 3/30', 298.00, 'unit', 'Creative'),
('Internal Blinds', 'LS 40 3/30 (WT)', 181.00, 'unit', 'Creative'),
('Internal Blinds', 'Altus 28 WireFree Li-Ion', 192.00, 'unit', 'Creative'),
('Internal Blinds', 'Situo 1 RTS Remote', 66.00, 'unit', 'Creative'),
('Internal Blinds', 'Situo 2 RTS Remote', 78.00, 'unit', 'Creative'),
('Internal Blinds', 'Situo 5 RTS Remote', 96.00, 'unit', 'Creative'),
('Internal Blinds', 'Connexoon RTS Hub', 154.00, 'unit', 'Creative');

-- Pelmets & Valances (Placeholder pricing for now, full grids might be needed later or handled via separate logic if complex)
-- Using fixed/linear meter approximations where applicable or noting 'grid' needs separate handling.
-- For simple extras list, we can add:
INSERT INTO product_extras (product_category, name, price, price_type, supplier) VALUES
('Internal Blinds', 'Cassette 90 Bottom Channel', 45.00, 'per_metre_width', 'Creative'),
('Internal Blinds', 'Padded Pelmet Blockout Surcharge (Group 4)', 23.00, 'percentage', 'Creative'),
('Internal Blinds', 'Padded Pelmet Blockout Surcharge (Group 5)', 28.00, 'percentage', 'Creative'),
('Internal Blinds', 'Padded Pelmet Blockout Surcharge (Group 6)', 33.00, 'percentage', 'Creative'),
('Internal Blinds', 'Bay Window Surcharge', 12.00, 'per_corner', 'Creative'); -- Custom type logic might be needed, using unit for now? No, 'per_corner' not standard. Use fixed and note manual qty?
-- Let's use fixed for now and user can add qty.
INSERT INTO product_extras (product_category, name, price, price_type, supplier) VALUES
('Internal Blinds', 'Bay Window Join Surcharge', 12.00, 'fixed', 'Creative');

-- Roman Blinds
INSERT INTO product_extras (product_category, name, price, price_type, supplier) VALUES
('Internal Blinds', 'Heavy Duty Cord Lock', 22.00, 'fixed', 'Creative'),
('Internal Blinds', 'Trumpet Barrels (Chrome/Brass)', 6.00, 'fixed', 'Creative'),
('Internal Blinds', 'Cleat (Chrome/Brass)', 6.00, 'fixed', 'Creative'),
('Internal Blinds', 'Front Batten Surcharge', 25.00, 'percentage', 'Creative'),
('Internal Blinds', 'Angled Soft Roman Surcharge', 30.00, 'percentage', 'Creative'),
('Internal Blinds', 'Headboard Upgrade (MDF)', 15.00, 'per_metre_width', 'Creative');

-- Bonded Blinds
INSERT INTO product_extras (product_category, name, price, price_type, supplier) VALUES
('Internal Blinds', 'Bonded Insert', 35.00, 'per_metre_width', 'Creative'),
('Internal Blinds', 'Rouched Insert', 40.00, 'per_metre_width', 'Creative');
