-- Migration: Insert Creative Security Door Extras

-- Locks & Hardware
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Security Doors', 'Locks & Hardware', 'Door Closer', 45.00, 'fixed', 'Creative', 'Standard Closer'),
('Security Doors', 'Locks & Hardware', 'Lever Handle', 75.00, 'fixed', 'Creative', 'Upgrade from standard'),
('Security Doors', 'Locks & Hardware', 'Bug Strip 25mm', 20.00, 'fixed', 'Creative', 'Sealing strip'),
('Security Doors', 'Locks & Hardware', 'Roller Wheel', 9.80, 'fixed', 'Creative', 'Replacement or Extra');

-- Frame & Structure
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Security Doors', 'Frame & Structure', 'Mid Rail', 0.00, 'fixed', 'Creative', 'Required for > 1200mm width or > 2400mm height');

-- Ensure they are active
UPDATE product_extras SET is_active = true WHERE product_category = 'Security Doors' AND supplier = 'Creative';
