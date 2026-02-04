-- Migration: Insert Creative External Blinds Extras

-- Acmeda Motorisation
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('External Blinds', 'Motorisation', 'Automate ARC FT Motor', 212, 'fixed', 'Creative', 'Ø45/15NM/15RPM'),
('External Blinds', 'Motorisation', 'AX30 Motor', 234, 'fixed', 'Creative', 'Ø45/240V/12RPM'),
('External Blinds', 'Motorisation', 'AX50 Motor', 313, 'fixed', 'Creative', 'Ø45/240V/12RPM'),
('External Blinds', 'Motorisation', 'Li-Ion 10NM Motor', 371, 'fixed', 'Creative', 'Ø45/12V/9RPM'),
('External Blinds', 'Motorisation', 'Push-1 Remote', 48, 'fixed', 'Creative', 'Single Channel'),
('External Blinds', 'Motorisation', 'Push-5 Remote', 53, 'fixed', 'Creative', '5 Channel'),
('External Blinds', 'Motorisation', 'Push-15 Remote', 59, 'fixed', 'Creative', '15 Channel'),
('External Blinds', 'Motorisation', 'Pulse 2 Hub', 191, 'fixed', 'Creative', 'Wi-Fi Hub'),
('External Blinds', 'Motorisation', 'Solar Wind & Sun Sensor', 175, 'fixed', 'Creative', 'Solar Powered'),
('External Blinds', 'Motorisation', 'Motion Sensor', 123, 'fixed', 'Creative', 'Automate A.R.T');

-- Somfy Motorisation
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('External Blinds', 'Motorisation', 'Altus 50 RTS 6/17', 370, 'fixed', 'Creative', 'Somfy'),
('External Blinds', 'Motorisation', 'Altus 50 RTS 10/17', 385, 'fixed', 'Creative', 'Somfy'),
('External Blinds', 'Motorisation', 'Altus 50 RTS 15/17', 405, 'fixed', 'Creative', 'Somfy'),
('External Blinds', 'Motorisation', 'Altus 50 RTS 25/17', 450, 'fixed', 'Creative', 'Somfy'),
('External Blinds', 'Motorisation', 'Altus 50 RTS 30/17', 470, 'fixed', 'Creative', 'Somfy'),
('External Blinds', 'Motorisation', 'Altus 50 RTS 40/17', 515, 'fixed', 'Creative', 'Somfy'),
('External Blinds', 'Motorisation', 'Situo 1 RTS Pure', 66, 'fixed', 'Creative', '1 Channel'),
('External Blinds', 'Motorisation', 'Situo 2 RTS Pure', 78, 'fixed', 'Creative', '2 Channel'),
('External Blinds', 'Motorisation', 'Situo 5 RTS Pure', 96, 'fixed', 'Creative', '5 Channel'),
('External Blinds', 'Motorisation', 'Telis 16 RTS', 239, 'fixed', 'Creative', '16 Channel'),
('External Blinds', 'Motorisation', 'Smoove Origin RTS', 61, 'fixed', 'Creative', '1 Channel Wall Switch'),
('External Blinds', 'Motorisation', 'Connexoon RTS', 154, 'fixed', 'Creative', 'Hub'),
('External Blinds', 'Motorisation', 'Tahoma Switch', 198, 'fixed', 'Creative', 'Hub'),
('External Blinds', 'Motorisation', 'Sunis RTS Sensor', 352, 'fixed', 'Creative', 'Sun Sensor'),
('External Blinds', 'Motorisation', 'Eolis RTS Sensor', 168, 'fixed', 'Creative', 'Wind Sensor'),
('External Blinds', 'Motorisation', 'Eolis 3D Sensor', 191, 'fixed', 'Creative', 'Motion Sensor');

-- Services
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('External Blinds', 'Services', 'Assembly Surcharge (Own Motor)', 50, 'fixed', 'Creative', 'Per blind'),
('External Blinds', 'Services', 'Assembly Surcharge (Re-cloth)', 55, 'fixed', 'Creative', 'Per blind');

-- Ensure they are active
UPDATE product_extras SET is_active = true WHERE product_category = 'External Blinds' AND supplier = 'Creative';
