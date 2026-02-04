-- Migration: Insert NBS Plantation Shutter Extras

-- Hardware
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Plantation Shutters', 'Hardware', 'U Channel (Top/Bottom)', 0.00, 'fixed', 'NBS', 'Aussie Made Inclusion'),
('Plantation Shutters', 'Hardware', 'Light Stop 16mm', 0.00, 'fixed', 'NBS', 'Aussie Made Inclusion');

-- Services (Generic placeholders)
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Plantation Shutters', 'Services', 'Check Measure', 0.00, 'fixed', 'NBS', 'Manual Price'),
('Plantation Shutters', 'Services', 'Installation', 0.00, 'fixed', 'NBS', 'Manual Price');

-- Ensure they are active
UPDATE product_extras SET is_active = true WHERE product_category = 'Plantation Shutters' AND supplier = 'NBS';
