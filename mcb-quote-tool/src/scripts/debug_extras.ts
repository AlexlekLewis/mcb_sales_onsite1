
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- FETCHING PRODUCTS ---');
    const { data: products, error: pError } = await supabase
        .from('products')
        .select('id, name, supplier, category')
        .in('supplier', ['NBS', 'Creative'])
        .order('supplier');

    if (pError) console.error(pError);
    else {
        console.table(products.map(p => ({
            name: p.name,
            cat: p.category,
            supplier: p.supplier
        })));
    }
}

run();
