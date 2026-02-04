-- NBS Plantation Shutters Data Seed
-- Run this in Supabase SQL Editor to populate products.

-- 1. Insert Products based on Square Meter Rate
-- Fusion Plus PVC: $195/sqm
-- Sovereign Wood: $245/sqm
-- Element 13 Aluminium Shutters: $310/sqm
-- Aussie Made PVC Shutters: $295/sqm

INSERT INTO products (supplier, category, name, pricing_type, pricing_data)
VALUES
(
    'NBS',
    'Plantation Shutters',
    'Fusion Plus PVC',
    'sqm',
    '{
        "price_per_sqm": 195.00,
        "min_charge": 0
    }'::jsonb
),
(
    'NBS',
    'Plantation Shutters',
    'Sovereign Wood',
    'sqm',
    '{
        "price_per_sqm": 245.00,
        "min_charge": 0
    }'::jsonb
),
(
    'NBS',
    'Plantation Shutters',
    'Element 13 Aluminium Shutters',
    'sqm',
    '{
        "price_per_sqm": 310.00,
        "min_charge": 0
    }'::jsonb
),
(
    'NBS',
    'Plantation Shutters',
    'Aussie Made PVC Shutters',
    'sqm',
    '{
        "price_per_sqm": 295.00,
        "min_charge": 0
    }'::jsonb
);

-- 2. Insert Price Group (Standard)
-- Essential to allow selection even if multiplier is just 1.0

INSERT INTO price_groups (supplier, category, group_code, group_name, multiplier)
VALUES
('NBS', 'Plantation Shutters', 'STD', 'Standard', 1.0);
