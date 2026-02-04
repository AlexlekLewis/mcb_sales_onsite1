import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: extras, error } = await supabase
    .from('product_extras')
    .select('supplier, product_category, extra_category, name, product_ids')
    .eq('supplier', 'Creative')
    .order('product_category');

  if (error) {
    console.error(error);
    return;
  }

  console.log('--- EXTRAS SAMPLE ---');
  // Group by product_category and extra_category to digest
  const summary: any = {};
  
  extras.forEach((e: any) => {
    const key = `${e.product_category} -> ${e.extra_category}`;
    if (!summary[key]) summary[key] = [];
    if (summary[key].length < 3) summary[key].push(e.name);
  });
  
  console.log(JSON.stringify(summary, null, 2));
}

check();
