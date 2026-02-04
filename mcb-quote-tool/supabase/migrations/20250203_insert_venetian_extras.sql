-- Migration: Insert NBS Venetian Extras

-- Hardware
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Venetians', 'Hardware', 'Box Brackets', 7.00, 'fixed', 'NBS', 'Per pair'),
('Venetians', 'Hardware', 'Centre Support Brackets', 2.20, 'fixed', 'NBS', 'Each'),
('Venetians', 'Hardware', 'Hold Down Clips (Wideline 50mm)', 7.00, 'fixed', 'NBS', 'Per pair');

-- Customisation / Options
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Venetians', 'Options', 'Mixed Colours / Stripes', 25.00, 'fixed', 'NBS', 'Per colour added'),
('Venetians', 'Options', 'Cloth Tape', 20.00, 'percentage', 'NBS', 'Surcharge on blind price'),
('Venetians', 'Options', 'Cutout', 25.00, 'fixed', 'NBS', 'Per cutout, max 130mm');

-- Ensure they are active
UPDATE product_extras SET is_active = true WHERE product_category = 'Venetians' AND supplier = 'NBS';
