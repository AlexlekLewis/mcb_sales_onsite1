-- Archive the duplicate 'Creative Curtain' (singular)
-- We use soft-delete (is_active = false) to preserve any existing quotes that might reference it.

UPDATE products 
SET is_active = false, 
    name = 'Creative Curtain (ARCHIVED)' 
WHERE id = 'dc0a8772-0296-490e-a4f1-48ecf2f3d713';
