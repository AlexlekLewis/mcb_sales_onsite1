
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the JSON data
const jsonPath = path.resolve(__dirname, '../../shutter_tech_data.json');
let rawData: any;

try {
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    rawData = JSON.parse(fileContent);
} catch (e) {
    console.error("Error reading extraction file:", e);
    process.exit(1);
}

async function run() {
    console.log("Starting Shutter Tech Update...");

    // 1. Process Products
    for (const p of rawData.products) {
        console.log(`Processing Product: ${p.name}`);

        // Prepare Pricing Data
        const pricing_data = {
            width_steps: p.widths,
            drop_steps: p.drops,
            grids: { "Standard": p.grid }
        };

        // Upsert Product
        let { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('name', p.name)
            .eq('supplier', 'Shutter Tech')
            .single();

        let productId = existing?.id;

        if (!existing) {
            const { data: created, error } = await supabase.from('products').insert({
                name: p.name,
                supplier: 'Shutter Tech',
                category: 'Roller Shutters', // As per plan
                pricing_type: 'grid',
                pricing_data: pricing_data
            }).select().single();
            if (error) {
                console.error(`Error creating ${p.name}`, error);
                continue;
            }
            productId = created.id;
        } else {
            // Update pricing data
            const { error } = await supabase.from('products')
                .update({ pricing_data: pricing_data })
                .eq('id', productId);
            if (error) { console.error(`Error updating ${p.name}`, error); }
        }

        // Insert a generic "Standard" fabric/color just so it's selectable?
        // Shutter Tech colors weren't explicitly extracted from the sheet (didn't look for them),
        // but usually there's a standard range. We'll add a placeholder.
        await supabase.from('fabrics').upsert({
            name: "Standard Color",
            brand: "Shutter Tech",
            price_group: "Standard",
            supplier: "Shutter Tech",
            product_category: "Roller Shutters",
            is_active: true
        }, { onConflict: 'name, product_category' });
    }

    // 2. Process Components (Extras)
    console.log(`Processing ${rawData.components.length} Components...`);

    for (const c of rawData.components) {
        // Skip empty or zero price if desired, but we'll include everything with a name
        if (!c.name) continue;

        const payload = {
            name: c.name,
            price: c.price,
            extra_category: c.category, // Correct column found via inspection
            supplier: 'Shutter Tech',
            product_category: 'Roller Shutters',
            is_active: true
        };


        const { data: existingExtra } = await supabase
            .from('product_extras')
            .select('id')
            .eq('name', c.name)
            .eq('product_category', 'Roller Shutters')
            .single();

        if (existingExtra) {
            const { error } = await supabase
                .from('product_extras')
                .update(payload)
                .eq('id', existingExtra.id);
            if (error) console.error(`Error updating extra ${c.name}:`, error);
        } else {
            const { error } = await supabase
                .from('product_extras')
                .insert(payload);
            if (error) console.error(`Error inserting extra ${c.name}:`, error);
        }
    }

    console.log("✅ Shutter Tech Update Complete.");
}

run();
