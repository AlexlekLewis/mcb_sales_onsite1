import fitz
import pandas as pd
import os
import re
import sys

def process_creative_curtains(pdf_path, output_path):
    print(f"Processing {pdf_path}...")
    doc = fitz.open(pdf_path)
    
    # --- Fabrics Extraction ---
    fabrics = []
    valid_suppliers = ["Charles Parsons", "Hoad", "Warwick", "James Dunlop", "Zepel", "Filigree", "Basford", "Maurice Kain", "Nettex", "Shaw", "Texstyle", "Wilson", "Four Families"]
    
    for i in [1, 2]:
        page = doc[i]
        words = page.get_text("words", sort=True)
        rows = {}
        for w in words:
            y = round(w[1], 1)
            if y not in rows: rows[y] = []
            rows[y].append(w[4])
        
        for y in sorted(rows.keys()):
            row_words = rows[y]
            if len(row_words) < 4: continue
            
            # Expecting: Index Supplier... Range... Width Group
            if row_words[0].isdigit() and row_words[-1].isdigit() and row_words[-2].isdigit():
                idx = row_words[0]
                group = row_words[-1]
                width = row_words[-2]
                
                # Combine the middle parts
                middle = " ".join(row_words[1:-2])
                
                # Extract Supplier
                supplier = "Unknown"
                fabric_range = middle
                for vs in valid_suppliers:
                    if middle.startswith(vs):
                        supplier = vs
                        fabric_range = middle[len(vs):].strip()
                        break
                
                fabrics.append({
                    "Index": int(idx),
                    "Supplier": supplier,
                    "Range": fabric_range,
                    "Width (mm)": int(width) if width.isdigit() else width, # Assume mm as per practice
                    "Group": int(group)
                })

    df_fabrics = pd.DataFrame(fabrics)
    print(f"Extracted {len(df_fabrics)} fabrics.")

    # --- Pricing Extraction ---
    pricing_rows = []
    
    for i in range(3, 8): # Pages 4-8 -> Groups 1-5
        group_num = i - 2
        page = doc[i]
        words = page.get_text("words", sort=True)
        rows = {}
        for w in words:
            y = round(w[1], 1)
            if y not in rows: rows[y] = []
            rows[y].append(w[4])
            
        for y in sorted(rows.keys()):
            row_words = rows[y]
            clean_words = [w.replace('$', '').replace(',', '') for w in row_words]
            
            # Look for: Width Price1 Price2
            # Heuristic: at least 3 numbers
            nums = []
            try:
                nums = [float(w) for w in clean_words if w.replace('.', '', 1).isdigit()]
            except:
                pass
                
            if len(nums) >= 3:
                # Assuming first num is Width, next two are prices
                # But sometimes we might catch "1.00 120 140" (perfect)
                # Or "4.20 600 700 5.00 800 900" (two columns on one line)
                
                # Let's iterate through triplets
                # Since the text is sorted, if columns are visual, they might be interleaved or sequential?
                # 'sort=True' usually goes left-to-right, top-to-bottom.
                # So "Col1_Width Col1_P1 Col1_P2 Col2_Width Col2_P1 Col2_P2"
                
                # Let's process the clean_words and consume 3 at a time if they are numbers?
                # The tokens might be mixed with text keywords?
                # The extracted text in previous step was clean.
                
                # Let's try to chunks of 3 numbers
                # But only if they appear in the row_words strictly?
                # row_words: ['1.00', '$120', '$140', '5.00', '$600', '$700']
                
                if len(nums) >= 3:
                    # Simpler logic: First 3 numbers are likely Width, P1, P2
                    # We accept if Width < 5000 (mm) and Prices > 0
                    w = nums[0]
                    p1 = nums[1]
                    p2 = nums[2]
                    
                    pricing_rows.append({
                        "Group": group_num,
                        "Width (mm)": w,
                        "Price (100% Fullness)": p1,
                        "Price (160% Fullness)": p2
                    })

    df_pricing = pd.DataFrame(pricing_rows)
    print(f"Extracted {len(df_pricing)} pricing rows.")
    
    if not df_pricing.empty:
        # Remove duplicates if any
        df_pricing = df_pricing.drop_duplicates()
        if "Group" in df_pricing.columns and "Width (mm)" in df_pricing.columns:
            df_pricing = df_pricing.sort_values(by=["Group", "Width (mm)"])
    else:
        print("Warning: No pricing rows extracted!")
    
    # Write to Excel
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        df_fabrics.to_excel(writer, sheet_name='Fabrics', index=False)
        df_pricing.to_excel(writer, sheet_name='Pricing', index=False)
        
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        process_creative_curtains(sys.argv[1], sys.argv[2])
    else:
        # Default for running in context
        input_pdf = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative Curtains Pricing Jun25.pdf"
        output_xlsx = "Products/Creative Curtains.xlsx"
        process_creative_curtains(input_pdf, output_xlsx)
