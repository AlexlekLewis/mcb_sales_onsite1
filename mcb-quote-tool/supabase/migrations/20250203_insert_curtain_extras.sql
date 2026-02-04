-- Migration: Insert Creative Curtains Extras

-- Heading & Tape
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Curtains', 'Heading & Tape', '160 Tape (Group 1-2)', 160, 'per_metre_width', 'Creative', 'Select for Fabric Groups 1 & 2'),
('Curtains', 'Heading & Tape', '160 Tape (Group 3-5)', 230, 'per_metre_width', 'Creative', 'Select for Fabric Groups 3, 4 & 5');

-- Surcharges
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Curtains', 'Surcharges', 'Surcharge - Drop 3.0m - 4.5m', 35, 'percentage', 'Creative', 'Base price increase'),
('Curtains', 'Surcharges', 'Surcharge - Drop 4.5m - 6.0m', 100, 'percentage', 'Creative', 'Base price increase'),
('Curtains', 'Surcharges', 'Surcharge - Fabric Width < 2.0m', 35, 'percentage', 'Creative', 'Base price increase');
