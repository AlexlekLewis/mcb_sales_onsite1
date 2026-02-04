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
                if all(nums[j] <= nums[j+1] for j in range(len(nums)-1)):
                     width_row = nums
                     width_y_index = i
                     break
            except:
                continue
                
    if not width_row: return None

    # Identify Data
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
        # Honeycomb often has Drops 600, 750, 900...
        # Widths 610, 760...
        
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

def extract_nbs_keywords(page_text):
    # Keywords to look for
    keywords = []
    
    # Aluminium
    if "Slimline" in page_text: keywords.append("Slimline 25mm")
    if "Wideline" in page_text: keywords.append("Wideline 50mm")
    
    # Honeycomb
    if "Single Cell" in page_text: keywords.append("Single Cell")
    if "Double Cell" in page_text: keywords.append("Double Cell")
    if "20mm" in page_text: keywords.append("20mm")
    if "25mm" in page_text: keywords.append("25mm")
    if "Translucent" in page_text: keywords.append("Translucent")
    if "Blockout" in page_text: keywords.append("Blockout")
    if "Sheer" in page_text: keywords.append("Sheer")
    
    # Groups
    match_group = re.search(r'GROUP\s*(\d+)', page_text, re.IGNORECASE)
    if match_group: keywords.append(f"Group {match_group.group(1)}")
    
    if not keywords: return "Unknown"
    return " ".join(keywords)

def process_nbs_batch1():
    base_path = "A Supplier Pricing, Info & Brochures (Alex Website)"
    files = [
        ("NBS Aluminium Venetians 25mm & 50mm Pricing Mar2025.pdf", "NBS Aluminium Venetians"),
        ("NBS Honeycomb Blinds (Arena) Pricing Mar2025.pdf", "NBS Honeycomb Blinds")
    ]
    
    for filename, product_name in files:
        pdf_path = os.path.join(base_path, filename)
        print(f"Processing {pdf_path}...")
        doc = fitz.open(pdf_path)
        
        extracted_sheets = {}
        
        for i, page in enumerate(doc):
            df = get_grid_from_page(page)
            if df is not None:
                text = page.get_text("text")
                name_hint = extract_nbs_keywords(text)
                
                sheet_name = f"{name_hint} P{i+1}".strip()
                if sheet_name == "Unknown P{i+1}":
                    sheet_name = f"Grid Page {i+1}"
                
                # Excel sheet name limit
                sheet_name = sheet_name[:31]
                
                # Unique
                c = 1
                base = sheet_name
                while sheet_name in extracted_sheets:
                    sheet_name = f"{base} ({c})"
                    c +=1
                
                extracted_sheets[sheet_name] = df
                print(f"  Extracted {sheet_name} ({len(df)} rows)")
        
        if extracted_sheets:
            out_path = f"Products/{product_name}.xlsx"
            with pd.ExcelWriter(out_path, engine='openpyxl') as writer:
                for name, df in extracted_sheets.items():
                    df.to_excel(writer, sheet_name=name, index=False)
            print(f"Saved to {out_path}")
        else:
            print(f"No grids found for {filename}")

if __name__ == "__main__":
    process_nbs_batch1()
