import fitz
import pandas as pd
import os
import re

def get_grid_from_page(page, product_name):
    words = page.get_text("words", sort=True)
    rows = {}
    for w in words:
        y = int(w[1]) # Relaxed grouping to integer
        if y not in rows: rows[y] = []
        rows[y].append(w[4])
    
    sorted_y = sorted(rows.keys())
    
    print(f"  Found {len(sorted_y)} text lines.")
    # Debug: Print first few lines to check alignment
    for i in range(min(15, len(sorted_y))):
         clean = [x for x in rows[sorted_y[i]] if x.isdigit()]
         print(f"    Line {i} (Y={sorted_y[i]}): {rows[sorted_y[i]]} -> Nums: {len(clean)}")

    # 1. Identify Width Header Row
    # Look for a row with many numbers (e.g. 960, 1260...)
    # Heuristic: Row with > 5 items, all numbers or mostly numbers
    
    width_row = []
    width_y_index = -1
    
    for i, y in enumerate(sorted_y):
        line = rows[y]
        clean_line = [x for x in line if x.isdigit()]
        if len(clean_line) > 5:
            # Check if strictly increasing?
            try:
                nums = [int(x) for x in clean_line]
                if all(nums[j] <= nums[j+1] for j in range(len(nums)-1)):
                     width_row = nums
                     width_y_index = i
                     break
            except:
                continue
                
    if not width_row:
        # Try finding header "Width"
        return None

    # 2. Extract Data Rows (Drop + Prices)
    data = []
    
    for i in range(width_y_index + 1, len(sorted_y)):
        y = sorted_y[i]
        line = rows[y]
        
        # Expecting First item = Drop (number), followed by prices
        # Prices might be currency formatted or just numbers.
        
        # Clean line tokens
        clean_tokens = [t.replace('$', '').replace(',', '') for t in line]
        nums = []
        for t in clean_tokens:
            try: nums.append(int(float(t)))
            except: pass
            
        if not nums: continue
        
        # Drop is nums[0]
        # Prices are nums[1:]
        # Must align with width_row
        
        # Logic: If we have roughly len(width_row) + 1 items, it's a match
        # Sometimes prices are missing/empty?
        # Let's assume dense grid.
        
        if len(nums) >= len(width_row) + 1:
            drop = nums[0]
            prices = nums[1:len(width_row)+1]
            
            row_dict = {"Drop": drop}
            for j, price in enumerate(prices):
                w_label = width_row[j]
                row_dict[w_label] = price
            data.append(row_dict)
            
    if data:
        df = pd.DataFrame(data)
        return df
    return None

def process_creative_external():
    input_pdf = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative External Blinds Pricing 07July2025.pdf"
    doc = fitz.open(input_pdf)
    
    products = [
        (7, "External Rollers"), # Page 8 (Index 7)
        (9, "Auto Awning"), # Page 10
        (11, "Straight Drop"), # Page 12
        (13, "Fixed Guide"), # Page 14
        (15, "Wire Guide"), # Page 16
        (18, "Veue Zipscreen"), # Page 19
        (20, "Veue Straight Drop"), # Page 21
        (22, "Zipscreen Extreme"), # Page 23
    ]
    
    output_path = "Products/Creative External Blinds.xlsx"
    
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        for page_idx, name in products:
            if page_idx < len(doc):
                print(f"Processing {name} on Page {page_idx + 1}...")
                df = get_grid_from_page(doc[page_idx], name)
                if df is not None:
                    print(f"  Extracted {len(df)} rows.")
                    df.to_excel(writer, sheet_name=name, index=False)
                else:
                    print(f"  Failed into extract grid for {name}")
            else:
                print(f"  Page {page_idx} out of range")
                
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    process_creative_external()
