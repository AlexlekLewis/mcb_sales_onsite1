
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- INSPECTING CREATIVE CURTAINS ---');
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier', 'Creative')
        .ilike('name', '%Curtain%');

    if (error) {
        console.error(error);
        return;
    }

    console.table(data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        pricing_type: p.pricing_type,
        data_keys: Object.keys(p.pricing_data || {}).join(', '),
        is_active: p.is_active,
        created_at: p.created_at
    })));
}

inspect();
