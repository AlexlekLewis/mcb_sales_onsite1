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
    
    # Identify Width Header
    width_row = []
    width_y_index = -1
    
    for i, y in enumerate(sorted_y):
        clean_line = [x for x in rows[y] if x.isdigit()]
        if len(clean_line) > 5:
            try:
                nums = [int(x) for x in clean_line]
                # Check for strictly increasing sequence
                if all(nums[j] <= nums[j+1] for j in range(len(nums)-1)):
                     width_row = nums
                     width_y_index = i
                     break
            except:
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
             except: pass
             
        if not nums: continue
        
        # Logic: Drop + Prices
        # PVC Venetian has Drop at start AND end?
        # Only take first number as Drop
        
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

def process_nbs_batch2():
    base_path = "A Supplier Pricing, Info & Brochures (Alex Website)"
    
    # Files
    pvc_path = os.path.join(base_path, "NBS PVC Venetian (Tuscany) Pricing Mar2025.pdf")
    shutters_path = os.path.join(base_path, "NBS Plantation Shutters Pricing (PVC, Timber & Aluminium) Mar2025.pdf")
    
    output_path = "Products/NBS Batch 2.xlsx"
    # Actually, keep distinct files if possible?
    # Task says "seperate sheets for each file." "place all of these sheets into a the "product" folder."
    # I'll enable saving to separate files: Products/NBS PVC Venetian.xlsx and Products/NBS Plantation Shutters.xlsx
    
    # 1. PVC Venetian
    print(f"Processing {pvc_path}...")
    doc = fitz.open(pvc_path)
    # Search for Grid on Page 3 (Index 2)
    grid_df = get_grid_from_page(doc[2])
    
    if grid_df is not None:
        out = "Products/NBS PVC Venetian.xlsx"
        with pd.ExcelWriter(out, engine='openpyxl') as writer:
            grid_df.to_excel(writer, sheet_name="PVC Venetian", index=False)
        print(f"Saved {out}")
    else:
        print("Failed to extract PVC Venetian grid.")

    # 2. Plantation Shutters
    print(f"Processing {shutters_path}...")
    doc = fitz.open(shutters_path)
    
    shutters_data = []
    
    # Text Search for Prices
    for page in doc:
        text = page.get_text("text")
        
        # Aussie Made
        if "Aussie Made" in text:
            match = re.search(r'\$(\d+)\s+per\s+square\s+metre', text, re.IGNORECASE)
            if match:
                shutters_data.append({
                    "Product": "Aussie Made PVC Shutter",
                    "Price Unit": "Per Sqm",
                    "Price": float(match.group(1))
                })
        
        # Surcharges?
        match_sur = re.search(r'User defined cost', text) # No
        
        # Manual fallback based on User Context if file is empty of other prices?
        # Not implementing context fallback unless requested. 
    
    if shutters_data:
        df = pd.DataFrame(shutters_data)
        out = "Products/NBS Plantation Shutters.xlsx"
        df.to_excel(out, index=False)
        print(f"Saved {out}")
    else:
        print("No plantation shutter prices found.")

if __name__ == "__main__":
    process_nbs_batch2()
