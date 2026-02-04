-- Migration: Insert NBS Roller Blind Extras

-- Hardware
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES 
('Internal Blinds', 'Hardware', 'Stainless Steel Chain', 14.40, 'fixed', 'NBS', 'Upgrade from standard'),
('Internal Blinds', 'Hardware', 'Compact Double Bracket Kit', 15.50, 'fixed', 'NBS', ''),
('Internal Blinds', 'Hardware', 'Vertical BR-BR Double Bracket Kit', 17.10, 'fixed', 'NBS', ''),
('Internal Blinds', 'Hardware', 'Multi-Link / Inline Link', 35.50, 'fixed', 'NBS', 'No bracket'),
('Internal Blinds', 'Hardware', 'Heavy Duty 63mm Tube', 11.00, 'per_metre_width', 'NBS', ''),
('Internal Blinds', 'Hardware', 'Helper Spring/Spring Assist', 33.25, 'fixed', 'NBS', 'Each, with adapter'),
('Internal Blinds', 'Hardware', 'Single Bracket Covers 40mm', 1.50, 'fixed', 'NBS', 'Per pair'),
('Internal Blinds', 'Hardware', 'Double Bracket Covers', 6.05, 'fixed', 'NBS', 'Per pair'),
('Internal Blinds', 'Hardware', 'Universal Link 0-75° Set', 148.00, 'fixed', 'NBS', '');

-- Bottom Rail / Finishing
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Internal Blinds', 'Options', 'Wrapped Bottom Rail', 15.75, 'per_metre_width', 'NBS', ''),
('Internal Blinds', 'Options', 'Rubber Insert for Bottom Rail', 1.70, 'per_metre_width', 'NBS', ''),
('Internal Blinds', 'Options', 'Side Hems (Light Filter)', 18.00, 'fixed', 'NBS', '');

-- Zero Gravity
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Internal Blinds', 'Motorisation', 'Zero Gravity (Chain Control)', 46.00, 'fixed', 'NBS', 'Light touch operation'),
('Internal Blinds', 'Motorisation', 'Zero Gravity (Chainless/Motor)', 65.60, 'fixed', 'NBS', 'Weightless feel');

-- Controls
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Internal Blinds', 'Hardware', 'Helper Spring Upgrade (Direct Drive)', 28.35, 'fixed', 'NBS', 'Instead of Gear Drive'),
('Internal Blinds', 'Hardware', 'Tube Upgrade 50mm (< 2100mm)', 6.00, 'per_metre_width', 'NBS', 'For motorised blinds'),
('Internal Blinds', 'Hardware', 'Tube Adaptors (for upgrade)', 3.80, 'fixed', 'NBS', '');

-- Fascia & Valance
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Internal Blinds', 'Pelmets & Valances', 'Sunboss Fascia 75mm Square', 29.40, 'per_metre_width', 'NBS', ''),
('Internal Blinds', 'Pelmets & Valances', 'Sunboss Fascia 100mm Square', 38.00, 'per_metre_width', 'NBS', ''),
('Internal Blinds', 'Pelmets & Valances', 'Sunboss Fascia Double Curved', 47.70, 'per_metre_width', 'NBS', ''),
('Internal Blinds', 'Pelmets & Valances', 'Fabric Wrapping (100mm/Curved)', 18.90, 'per_metre_width', 'NBS', 'Extra'),
('Internal Blinds', 'Pelmets & Valances', 'Linea Valance 98mm', 36.00, 'per_metre_width', 'NBS', 'With fabric insert'),
('Internal Blinds', 'Pelmets & Valances', 'Linea Valance 140mm', 51.00, 'per_metre_width', 'NBS', 'With fabric insert'),
('Internal Blinds', 'Pelmets & Valances', 'Linea Valance Bonded/Railroaded', 15.00, 'per_metre_width', 'NBS', 'Extra');

-- Accessories
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Internal Blinds', 'General', 'Tassle', 7.80, 'fixed', 'NBS', 'Each'),
('Internal Blinds', 'General', 'Gold/Silver Rings', 4.60, 'fixed', 'NBS', 'Each'),
('Internal Blinds', 'General', 'Crochet Pull Rings', 4.60, 'fixed', 'NBS', 'Each'),
('Internal Blinds', 'General', 'Extra Long Chain (> 3000mm)', 6.00, 'fixed', 'NBS', 'Nickel or Stainless');

-- Design Surcharges
INSERT INTO product_extras (product_category, extra_category, name, price, price_type, supplier, notes)
VALUES
('Internal Blinds', 'Surcharges', 'Designer Pricing', 10.00, 'percentage', 'NBS', 'On Fancy price'),
('Internal Blinds', 'Surcharges', 'Elegant Pricing', 20.00, 'percentage', 'NBS', 'On Fancy price'),
('Internal Blinds', 'Surcharges', 'Linea Valance Railroading', 25.00, 'percentage', 'NBS', 'Surcharge');

-- Ensure they are active
UPDATE product_extras SET is_active = true WHERE product_category = 'Internal Blinds' AND supplier = 'NBS';
