-- Migration: Add margin and GST fields to quotes and quote_items
-- Created: 2025-02-03

-- Add margin settings to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS overall_margin_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS show_gst BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add pricing breakdown to quote_items table
ALTER TABLE quote_items
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS item_margin_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sell_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS item_config JSONB DEFAULT '{}';

-- Update existing quote_items to set cost_price = calculated_price / quantity (backwards compatibility)
UPDATE quote_items 
SET cost_price = CASE 
    WHEN quantity > 0 THEN calculated_price / quantity 
    ELSE calculated_price 
END,
sell_price = CASE 
    WHEN quantity > 0 THEN calculated_price / quantity 
    ELSE calculated_price 
END
WHERE cost_price IS NULL;
