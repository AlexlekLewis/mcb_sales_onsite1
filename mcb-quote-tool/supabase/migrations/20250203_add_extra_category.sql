-- Migration: Add extra_category to product_extras and categorize items
ALTER TABLE product_extras ADD COLUMN IF NOT EXISTS extra_category text DEFAULT 'General';

-- Update Creative Internal Blinds Extras
UPDATE product_extras SET extra_category = 'Agencies / Install' WHERE supplier = 'Creative' AND name IN ('Bracket Covers', 'Chain - Metal / Plastic (< 2.25m)', 'Chain Tensioner', 'Chain Winder', 'D30 Rail - Bubble Seal', 'Double Brackets', 'Extension Brackets (55mm)', 'Spring / Booster (S45)', 'Tube Upgrade S45 H/D');

UPDATE product_extras SET extra_category = 'Services' WHERE supplier = 'Creative' AND name IN ('Reverse Roll', 'Cut Back (Screen/Holland)', 'Scallop Finish');

UPDATE product_extras SET extra_category = 'Motorisation' WHERE supplier = 'Creative' AND name IN ('Li-Ion Zero 1.1 Nm Motor', 'Li-Ion 3.0 Nm Motor', 'Solar Panel V2', 'Push 1 Channel Remote', 'Push 5 Channel Remote', 'Push 15 Channel Remote', 'Automate Pulse 2 Hub', 'Sonesse 40 RTS 3/30', 'LS 40 3/30 (WT)', 'Altus 28 WireFree Li-Ion', 'Situo 1 RTS Remote', 'Situo 2 RTS Remote', 'Situo 5 RTS Remote', 'Connexoon RTS Hub');

UPDATE product_extras SET extra_category = 'Pelmets & Valances' WHERE supplier = 'Creative' AND name IN ('Cassette 90 Bottom Channel', 'Padded Pelmet Blockout Surcharge (Group 4)', 'Padded Pelmet Blockout Surcharge (Group 5)', 'Padded Pelmet Blockout Surcharge (Group 6)', 'Bay Window Surcharge', 'Bay Window Join Surcharge');

UPDATE product_extras SET extra_category = 'Roman Blinds' WHERE supplier = 'Creative' AND name IN ('Heavy Duty Cord Lock', 'Trumpet Barrels (Chrome/Brass)', 'Cleat (Chrome/Brass)', 'Front Batten Surcharge', 'Angled Soft Roman Surcharge', 'Headboard Upgrade (MDF)');

UPDATE product_extras SET extra_category = 'Bonded Blinds' WHERE supplier = 'Creative' AND name IN ('Bonded Insert', 'Rouched Insert');

-- NB for NBS, mostly seem to be General or Motors.
UPDATE product_extras SET extra_category = 'Motorisation' WHERE supplier = 'NBS' AND name LIKE '%Motor%';
