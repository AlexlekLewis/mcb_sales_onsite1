import fitz
import pandas as pd
import os
import re

def get_grid_from_page(page):
    words = page.get_text("words", sort=True)
    rows = {}
    for w in words:
        y = int(w[1])
        if y not in rows: rows[y] = []
        rows[y].append(w[4])
    
    sorted_y = sorted(rows.keys())
    
    # 1. Identify Width Header Row
    width_row = []
    width_y_index = -1
    
    for i, y in enumerate(sorted_y):
        line = rows[y]
        clean_line = [x for x in line if x.isdigit()]
        if len(clean_line) > 5:
            try:
                nums = [int(x) for x in clean_line]
                # Check for increasing sequence
                if all(nums[j] <= nums[j+1] for j in range(len(nums)-1)):
                     width_row = nums
                     width_y_index = i
                     break
            except:
                continue
                
    if not width_row: return None

    # 2. Extract Data Rows
    data = []
    for i in range(width_y_index + 1, len(sorted_y)):
        y = sorted_y[i]
        line = rows[y]
        
        clean_tokens = [t.replace('$', '').replace(',', '') for t in line]
        nums = []
        for t in clean_tokens:
            try: nums.append(int(float(t)))
            except: pass
            
        if not nums: continue
        
        # Heuristic: Drop + Prices
        # Length check
        if len(nums) >= len(width_row):
            # Assumption: First is Drop, Rest are Prices
            # If len > width_row + 1, maybe extra columns?
            # If len == width_row, usually drop + prices (total width_row + 1 items needed)
            # Wait, if width_row has 10 items (columns), we need 11 nums (1 drop + 10 prices)
            
            if len(nums) >= len(width_row):
                # Take first as drop
                drop = nums[0]
                # Take next N as prices
                prices = nums[1:]
                
                # Check if we have enough prices
                if len(prices) >= len(width_row) - 1: 
                    # Allow missing last price?
                    # or if len(nums) == len(width_row), maybe Drop is missing?
                    # Let's assume standard format: Drop first.
                    
                    row_dict = {"Drop": drop}
                    for j, w_label in enumerate(width_row):
                        if j < len(prices):
                            row_dict[w_label] = prices[j]
                    data.append(row_dict)

    if data:
        return pd.DataFrame(data)
    return None

def process_creative_internal():
    input_pdf = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative Internal Blinds Pricing 07July2025.pdf"
    doc = fitz.open(input_pdf)
    
    current_product = "Unknown Product"
    extracted_sheets = {}
    
    product_keywords = ["Roller Blinds", "Roman Blinds", "Panel Glides", "Vertical Blinds", "Venetian Blinds", "Pelmet", "Valance"]
    
    for page_num, page in enumerate(doc):
        text = page.get_text("text")
        
        # Detect Product
        for pk in product_keywords:
            if pk.upper() in text.upper():
                current_product = pk
                # Don't break, keep looking for specific subtypes or groups?
        
        # Detect Group
        group = ""
        match_group = re.search(r'Group[-\s]*(\d+)', text, re.IGNORECASE)
        if match_group:
            group = f"Group {match_group.group(1)}"
            
        # Extract Grid
        df = get_grid_from_page(page)
        if df is not None:
            sheet_name = f"{current_product} {group} P{page_num+1}".strip()[:31] # Excel sheet limit 31 chars
            # Ensure unique name
            counter = 1
            base_name = sheet_name
            while sheet_name in extracted_sheets:
                sheet_name = f"{base_name} ({counter})"
                counter += 1
                
            extracted_sheets[sheet_name] = df
            print(f"Extracted {sheet_name} ({len(df)} rows)")

    output_path = "Products/Creative Internal Blinds.xlsx"
    if extracted_sheets:
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            for name, df in extracted_sheets.items():
                df.to_excel(writer, sheet_name=name, index=False)
        print(f"Saved to {output_path}")
    else:
        print("No grids found.")

if __name__ == "__main__":
    process_creative_internal()
