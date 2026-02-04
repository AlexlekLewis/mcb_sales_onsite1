import fitz
import pandas as pd
import os
import re

def get_grid_from_words(words):
    rows = {}
    for w in words:
        y = int(w[1])
        if y not in rows: rows[y] = []
        rows[y].sort(key=lambda x: x[0])
        rows[y].append(w[4])
    
    sorted_y = sorted(rows.keys())
    
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

def extract_extras_table(page):
    # Heuristic for generic table: Look for 3 columns "Item", "Cost", "Unit"
    # Or just lines with a price $XX.XX
    
    content = []
    words = page.get_text("words", sort=True)
    rows = {}
    for w in words:
        y = int(w[1])
        if y not in rows: rows[y] = []
        rows[y].sort(key=lambda x: x[0])
        rows[y].append(w[4])
        
    sorted_y = sorted(rows.keys())
    
    for y in sorted_y:
        line = rows[y]
        text_line = " ".join(line)
        
        # Regex to find Price at end or middle?
        # often: Item Name ... $12.50 ... Each
        # Find $
        match = re.search(r'\$(\d+\.?\d*)', text_line)
        if match:
            price = match.group(0)
            # Text before price
            parts = text_line.split(price)
            item = parts[0].strip()
            unit = parts[1].strip() if len(parts) > 1 else ""
            
            content.append({"Item": item, "Price": price, "Unit": unit, "Raw": text_line})
            
    return pd.DataFrame(content)

def extract_text_rules(page):
    text = page.get_text("text")
    lines = text.split('\n')
    rules = []
    
    keywords = ["extra", "surcharge", "plus", "add", "deduct", "cost"]
    
    for line in lines:
        if any(k in line.lower() for k in keywords) or '$' in line or '%' in line:
            # Filter out likely grid lines (too many numbers)
            nums = re.findall(r'\d+', line)
            if len(nums) > 4: continue 
            
            if len(line.strip()) > 10:
                 rules.append({"Rule": line.strip()})
                 
    return pd.DataFrame(rules)

def process_nbs_rollers_deep():
    path = "A Supplier Pricing, Info & Brochures (Alex Website)/NBS Roller Blinds (Blockout & Screens) Mar2025.pdf"
    doc = fitz.open(path)
    
    data_grids = {}
    data_extras = []
    data_rules = []
    
    # 1. Text Rules (Pages 1-5)
    print("Scanning rules...")
    for i in range(5):
        df = extract_text_rules(doc[i])
        if not df.empty:
            data_rules.append(df)
            
    # 2. Grids (Pages 6-13) - Split Page Logic
    print("Scanning grids...")
    for i in range(5, 14):
        if i >= len(doc): break
        page = doc[i]
        words = page.get_text("words", sort=True)
        
        # Header (Top of page)
        header_text = " ".join([w[4] for w in words if w[1] < 100])
        
        # Split Words
        left_words = [w for w in words if w[2] < 425]
        right_words = [w for w in words if w[0] > 425]
        
        df_left = get_grid_from_words(left_words)
        if df_left is not None:
             category_hint = "Left Grid"
             # Try refining name from text above grid but below header?
             # For now, append unique name
             name = f"P{i+1} Left"
             data_grids[name] = df_left
             
        df_right = get_grid_from_words(right_words)
        if df_right is not None:
             name = f"P{i+1} Right"
             data_grids[name] = df_right
             
    # 3. Extras (Pages 14-End)
    print("Scanning extras...")
    for i in range(13, len(doc)):
        df = extract_extras_table(doc[i])
        if not df.empty:
            data_extras.append(df)
            
    # Save
    out = "Products/NBS Roller Blinds (Deep).xlsx"
    with pd.ExcelWriter(out, engine='openpyxl') as writer:
        # Grids
        for name, df in data_grids.items():
            df.to_excel(writer, sheet_name=name, index=False)
            
        # Extras
        if data_extras:
            full_extras = pd.concat(data_extras)
            full_extras.to_excel(writer, sheet_name="Extras", index=False)
            
        # Rules
        if data_rules:
            full_rules = pd.concat(data_rules)
            full_rules.to_excel(writer, sheet_name="Surcharges & Rules", index=False)
            
    print(f"Saved {out}")

if __name__ == "__main__":
    process_nbs_rollers_deep()
