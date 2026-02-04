-- Migration: Insert NBS Honeycomb Extras

-- Design Upgrades
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Honeycomb', 'Options', 'Top-Down/Bottom-Up Upgrade', 20.00, 'percentage', 'NBS', 'Easy Rise pricing + 20%'),
('Honeycomb', 'Options', 'Skylight Upgrade', 40.00, 'percentage', 'NBS', 'Cordless pricing + 40%'),
('Honeycomb', 'Options', 'Skylight Side Guides', 35.90, 'per_metre_width', 'NBS', 'Per metre'),
('Honeycomb', 'Hardware', 'Extendable Pole (Cordless)', 52.76, 'fixed', 'NBS', 'For operating cordless blinds');

-- Ensure they are active
UPDATE product_extras SET is_active = true WHERE product_category = 'Honeycomb' AND supplier = 'NBS';
