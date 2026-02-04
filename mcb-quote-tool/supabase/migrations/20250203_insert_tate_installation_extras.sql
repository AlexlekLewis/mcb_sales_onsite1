-- Migration: Insert Tate Volitakis Installation Rates
-- These are installers' rates that apply across multiple product categories

-- Internal Blinds Installation
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Internal Blinds', 'Installation', 'Install - Holland Blind', 13.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Internal Blinds', 'Installation', 'Install - Venetian Blind', 10.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Internal Blinds', 'Installation', 'Install - Cellular Blind', 30.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Internal Blinds', 'Installation', 'Install - Vertical Blind', 10.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Internal Blinds', 'Installation', 'Install - Panel Glide', 18.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Internal Blinds', 'Installation', 'Install - Roman Blind', 15.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Internal Blinds', 'Installation', 'Install - FRS Pelmet', 5.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Internal Blinds', 'Installation', 'Install - Timber Pelmet', 20.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Internal Blinds', 'Installation', 'Install - Width > 2200 Surcharge', 10.00, 'fixed', 'Tate Volitakis', ''),
('Internal Blinds', 'Installation', 'Install - Height > 3000 Surcharge', 10.00, 'fixed', 'Tate Volitakis', ''),
('Internal Blinds', 'Installation', 'Install - Motor Surcharge', 15.00, 'fixed', 'Tate Volitakis', ''),
('Internal Blinds', 'Installation', 'Install - Brick/Concrete/Steel', 30.00, 'fixed', 'Tate Volitakis', 'Surcharge');

-- Curtains Installation
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Curtains', 'Installation', 'Install - Curtain (up to 3m)', 45.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Curtains', 'Installation', 'Install - Curtain (3-4m)', 60.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Curtains', 'Installation', 'Install - Curtain (4-5m)', 75.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Curtains', 'Installation', 'Install - Curtain (5-6m)', 90.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Curtains', 'Installation', 'Install - Curtain Motor', 40.00, 'fixed', 'Tate Volitakis', 'Surcharge'),
('Curtains', 'Installation', 'Install - Tie Back (pair)', 10.00, 'fixed', 'Tate Volitakis', ''),
('Curtains', 'Installation', 'Install - Verishade', 40.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Curtains', 'Installation', 'Install - Brick/Concrete/Steel', 30.00, 'fixed', 'Tate Volitakis', 'Surcharge'),
('Curtains', 'Installation', 'Install - Steel Fitting', 50.00, 'fixed', 'Tate Volitakis', 'Surcharge');

-- Plantation Shutters Installation
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Plantation Shutters', 'Installation', 'Install - Shutter (per panel)', 15.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Plantation Shutters', 'Installation', 'Install - Height > 3000 Surcharge', 30.00, 'fixed', 'Tate Volitakis', ''),
('Plantation Shutters', 'Installation', 'Install - Caulking of Frames', 15.00, 'fixed', 'Tate Volitakis', '');

-- External Blinds Installation
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('External Blinds', 'Installation', 'Install - Auto Awning', 80.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('External Blinds', 'Installation', 'Install - Straight Drop', 80.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('External Blinds', 'Installation', 'Install - Fixed Guide', 80.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('External Blinds', 'Installation', 'Install - Folding Arm (Standard)', 450.00, 'fixed', 'Tate Volitakis', 'Picollo/Sirroco/Viento'),
('External Blinds', 'Installation', 'Install - Folding Arm (Cabrera)', 500.00, 'fixed', 'Tate Volitakis', ''),
('External Blinds', 'Installation', 'Install - Width > 3500 Surcharge', 10.00, 'fixed', 'Tate Volitakis', ''),
('External Blinds', 'Installation', 'Install - Motor Surcharge', 20.00, 'fixed', 'Tate Volitakis', ''),
('External Blinds', 'Installation', 'Install - Eave/Fascia Tiled Roof', 100.00, 'fixed', 'Tate Volitakis', 'Surcharge'),
('External Blinds', 'Installation', 'Install - Eave/Fascia Colorbond', 200.00, 'fixed', 'Tate Volitakis', 'Surcharge'),
('External Blinds', 'Installation', 'Install - Steel Fit', 80.00, 'fixed', 'Tate Volitakis', 'Surcharge');

-- Roller Shutters Installation
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Roller Shutters', 'Installation', 'Install - Roller Shutter', 120.00, 'fixed', 'Tate Volitakis', 'Base rate'),
('Roller Shutters', 'Installation', 'Install - Width > 2800 Surcharge', 40.00, 'fixed', 'Tate Volitakis', ''),
('Roller Shutters', 'Installation', 'Install - Height > 3500 Surcharge', 50.00, 'fixed', 'Tate Volitakis', ''),
('Roller Shutters', 'Installation', 'Install - Aluminium Shutter (per panel)', 60.00, 'fixed', 'Tate Volitakis', 'Base rate');

-- Services (General - apply to all categories)
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Internal Blinds', 'Services', 'Check Measure', 60.00, 'fixed', 'Tate Volitakis', ''),
('Internal Blinds', 'Services', 'Service Call', 60.00, 'fixed', 'Tate Volitakis', ''),
('Internal Blinds', 'Services', 'Minimum Call Out Fee', 50.00, 'fixed', 'Tate Volitakis', ''),
('Internal Blinds', 'Services', 'Take Down Internal', 10.00, 'fixed', 'Tate Volitakis', 'Per item'),
('Internal Blinds', 'Services', 'Disposal Internal', 10.00, 'fixed', 'Tate Volitakis', 'Per item'),
('External Blinds', 'Services', 'Take Down External', 25.00, 'fixed', 'Tate Volitakis', 'Per item'),
('External Blinds', 'Services', 'Disposal External', 30.00, 'fixed', 'Tate Volitakis', 'Per item'),
('External Blinds', 'Services', 'Take Down Folding Arm', 200.00, 'fixed', 'Tate Volitakis', 'Per item'),
('External Blinds', 'Services', 'Disposal Folding Arm', 100.00, 'fixed', 'Tate Volitakis', 'Per item'),
('Internal Blinds', 'Services', 'Travel (> 50km)', 0.80, 'per_km', 'Tate Volitakis', 'Per km'),
('Internal Blinds', 'Services', 'City Surcharge', 70.00, 'fixed', 'Tate Volitakis', '');

-- Ensure they are active
UPDATE product_extras SET is_active = true WHERE supplier = 'Tate Volitakis';
