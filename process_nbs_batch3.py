import fitz
import pandas as pd
import os
import re

def get_grid_from_words(words):
    rows = {}
    for w in words:
        y = int(w[1])
        if y not in rows: rows[y] = []
        rows[y].append(w[4])
    
    sorted_y = sorted(rows.keys())
    
    # Identify Width Header
    width_row = []
    width_y_index = -1
    
    for i, y in enumerate(sorted_y):
        line = rows[y]
        clean_line = [x for x in line if x.isdigit()]
        if len(clean_line) > 5:
            try:
                nums = [int(x) for x in clean_line]
                if all(nums[j] <= nums[j+1] for j in range(len(nums)-1)):
                     width_row = nums
                     width_y_index = i
                     break
            except Exception as e:
                print(f"  Warning: Skipped potential width row due to error: {e}")
                continue
                
    if not width_row: return None

    data = []
    for i in range(width_y_index + 1, len(sorted_y)):
        y = sorted_y[i]
        line = rows[y]
        clean_tokens = [t.replace('$', '').replace(',', '') for t in line]
        nums = []
        for t in clean_tokens:
             try: nums.append(int(float(t)))
             except ValueError: pass # Expected for non-numeric tokens
             
        if not nums: continue
        
        if len(nums) >= len(width_row):
            drop = nums[0]
            prices = nums[1:]
            
            row_dict = {"Drop": drop}
            for j, val in enumerate(prices):
                if j < len(width_row):
                    row_dict[width_row[j]] = val
            data.append(row_dict)
            
    if data: return pd.DataFrame(data)
    return None

def extract_header(words):
    # Extract text from words, joined by space
    # Sort by Y then X
    # Actually words are already passed in some order? No, filter first.
    # We want to capture "GROUP 1 - PLAIN"
    # Just join all text
    text = " ".join([w[4] for w in words])
    return text

def process_nbs_batch3():
    base_path = "A Supplier Pricing, Info & Brochures (Alex Website)"
    
    # Files
    roller_path = os.path.join(base_path, "NBS Roller Blinds (Blockout & Screens) Mar2025.pdf")
    woodlike_path = os.path.join(base_path, "NBS Woodlike Venetians (Urbanwood) Mar2025.pdf")
    
    # 1. Roller Blinds
    print(f"Processing {roller_path}...")
    doc = fitz.open(roller_path)
    
    extracted_sheets = {}
    # Pages 6-13 (Indices 5-12)
    for i in range(5, 14): # Scan range
        if i >= len(doc): break
        
        page = doc[i]
        words = page.get_text("words", sort=True)
        
        # Split Words by X=425
        left_words = [w for w in words if w[2] < 425]
        right_words = [w for w in words if w[0] > 425]
        
        # Header text detection (approximate)
        # Assuming header is at top
        header_left = extract_header([w for w in left_words if w[1] < 130])
        header_right = extract_header([w for w in right_words if w[1] < 130])
        
        # Process Left
        df_left = get_grid_from_words(left_words)
        if df_left is not None:
             name = f"Roller P{i+1} L - {header_left[:20]}"
             name = re.sub(r'[\\/*?:\[\]]', '', name).strip()
             extracted_sheets[name] = df_left
             print(f"  Extracted {name}")

        # Process Right
        df_right = get_grid_from_words(right_words)
        if df_right is not None:
             name = f"Roller P{i+1} R - {header_right[:20]}"
             name = re.sub(r'[\\/*?:\[\]]', '', name).strip()
             extracted_sheets[name] = df_right
             print(f"  Extracted {name}")

    if extracted_sheets:
        out = "Products/NBS Roller Blinds.xlsx"
        with pd.ExcelWriter(out, engine='openpyxl') as writer:
             for name, df in extracted_sheets.items():
                 # Truncate sheet name to 31
                 safe_name = name[:31]
                 df.to_excel(writer, sheet_name=safe_name, index=False)
        print(f"Saved {out}")
    else:
        print("No grids found for Roller Blinds")

    # 2. Woodlike Venetians
    print(f"Processing {woodlike_path}...")
    doc = fitz.open(woodlike_path)
    # Page 3 (Index 2)
    words = doc[2].get_text("words", sort=True)
    df = get_grid_from_words(words)
    
    if df is not None:
        out = "Products/NBS Woodlike Venetians.xlsx"
        with pd.ExcelWriter(out, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name="Woodlike Venetians", index=False)
        print(f"Saved {out}")
    else:
        print("No grid found for Woodlike Venetians")

if __name__ == "__main__":
    process_nbs_batch3()
