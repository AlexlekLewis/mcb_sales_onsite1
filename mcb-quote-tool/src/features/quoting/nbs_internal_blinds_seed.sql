-- NBS Internal Blinds Data Seed (Updated)
-- Run this in Supabase SQL Editor to populate products and initial options.
-- NOTE: The 'grids' JSON must be actively populated with the real prices from the PDF.

-- 1. Insert Products (Holland Blind & Screen)
-- Use 'grids' object to support multiple pricing groups.

INSERT INTO products (supplier, category, name, pricing_type, pricing_data)
VALUES
(
    'NBS',
    'Internal Blinds',
    'Holland Blind',
    'grid',
    '{
        "width_steps": [600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000],
        "drop_steps": [600, 900, 1200, 1500, 1800, 2100, 2400],
        "grids": {
            "1": [
                [0, 0, 0, 0, 0, 0, 0], -- Group 1 Pricing
                [0, 0, 0, 0, 0, 0, 0]
            ],
            "Fancy": [
                [0, 0, 0, 0, 0, 0, 0], -- Fancy Pricing
                [0, 0, 0, 0, 0, 0, 0]
            ]
        }
    }'::jsonb
),
(
    'NBS',
    'Internal Blinds',
    'Screen',
    'grid',
    '{
        "width_steps": [600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000],
        "drop_steps": [600, 900, 1200, 1500, 1800, 2100, 2400],
        "grids": {
            "1": [
                [0, 0, 0, 0, 0, 0, 0], -- Group 1 Pricing
                [0, 0, 0, 0, 0, 0, 0]
            ],
            "2": [
                [0, 0, 0, 0, 0, 0, 0], -- Group 2 Pricing
                [0, 0, 0, 0, 0, 0, 0]
            ]
        }
    }'::jsonb
);

-- 2. Insert Price Groups
-- Ensure these match logic: "1", "Fancy", "2"

INSERT INTO price_groups (supplier, category, group_code, group_name, multiplier)
VALUES
('NBS', 'Internal Blinds', '1', 'Group 1', 1.0),
('NBS', 'Internal Blinds', 'Fancy', 'Fancy', 1.0),
('NBS', 'Internal Blinds', '2', 'Group 2', 1.0);

-- 3. Insert Extras / Components
-- Flattened list of components found in "Component Tree".

INSERT INTO product_extras (supplier, product_category, name, price, price_type, notes)
VALUES
-- Drives
('NBS', 'Internal Blinds', 'Chain Drive (std)', 0.00, 'fixed', 'Included'),
('NBS', 'Internal Blinds', 'Spring Assist', 25.00, 'fixed', 'Optional per blind'),
('NBS', 'Internal Blinds', 'Motorisation - Hardwired', 120.00, 'fixed', 'Requires electrician'),
('NBS', 'Internal Blinds', 'Motorisation - Battery', 150.00, 'fixed', 'Rechargeable'),

-- Controls (Remotes)
('NBS', 'Internal Blinds', 'Remote Control (1 Channel)', 45.00, 'fixed', ''),
('NBS', 'Internal Blinds', 'Remote Control (15 Channel)', 85.00, 'fixed', ''),
('NBS', 'Internal Blinds', 'Wall Switch (1 Channel)', 55.00, 'fixed', ''),
('NBS', 'Internal Blinds', 'Wall Switch (15 Channel)', 95.00, 'fixed', ''),

-- Hardware / Pelmets
('NBS', 'Internal Blinds', 'Pelmet - Anodised', 35.00, 'per_metre_width', ''),
('NBS', 'Internal Blinds', 'Pelmet - Powdercoated', 45.00, 'per_metre_width', 'Standard Colors'),
('NBS', 'Internal Blinds', 'Bottom Rail - Round', 0.00, 'fixed', 'Standard'),
('NBS', 'Internal Blinds', 'Bottom Rail - Flat', 0.00, 'fixed', 'Standard'),
('NBS', 'Internal Blinds', 'Wire Guide System', 80.00, 'fixed', 'External/Internal use'),

-- Fabrics
('NBS', 'Internal Blinds', 'Vibe Blockout Fabric Upgrade', 15.00, 'percentage', 'Add 15%');
