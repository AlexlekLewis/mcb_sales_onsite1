import fitz
import re
import pandas as pd
import os

def get_rows_from_page(page):
    words = page.get_text("words", sort=True)
    rows = {}
    for w in words:
        y = round(w[1], 1)
        if y not in rows: rows[y] = []
        rows[y].append(w[4])
    return [rows[y] for y in sorted(rows.keys())]

def extract_from_flyscreens(pdf_path):
    doc = fitz.open(pdf_path)
    data = []
    
    # Page 1 analysis
    page = doc[0]
    rows = get_rows_from_page(page)
    
    current_section = "Flyscreens"
    
    for row_words in rows:
        line = " ".join(row_words)
        
        if "Window Grill" in line:
            current_section = "Window Grill"
        
        # Look for Size + 2 Prices (Flyscreens)
        # e.g. 600x1200 23.00 28.00
        clean_words = [w.replace('$','') for w in row_words]
        
        # Regex for size in first word/token?
        size_match = re.search(r'(\d+\s*x\s*\d+)', clean_words[0]) if clean_words else None
        
        nums = []
        for w in clean_words:
             try: nums.append(float(w))
             except: pass
             
        if size_match and len(nums) >= 2:
            data.append({
                "Category": current_section,
                "Item": size_match.group(1),
                "Price (Fibreglass)": nums[-2], # Assuming last two are prices
                "Price (Alum/Bal)": nums[-1]
            })
            continue

        # Look for Item + Price (Grills/Doors)
        # e.g. "Diamond 115.00" or "Fibreglass Screen 690.00"
        if len(nums) == 1 and not size_match:
             # Heuristic: Text followed by Price
             price = nums[0]
             # Reconstruct item name from words that are NOT the price
             # This is tricky if price is in middle. 
             # usually price is last.
             if clean_words[-1].replace('.', '', 1).isdigit():
                 item_name = " ".join(clean_words[:-1])
                 if len(item_name) > 2: # Filter noise
                     data.append({
                        "Category": current_section,
                        "Item": item_name,
                        "Price": price
                     })

    return pd.DataFrame(data)

def extract_from_invisigard(pdf_path):
    doc = fitz.open(pdf_path)
    data = []
    
    for page in doc:
        rows = get_rows_from_page(page)
        for row_words in rows:
            clean_words = [w.replace('$','') for w in row_words]
            line = " ".join(clean_words)
            
            # Pattern: 820x2050 747.00
            # Check for size
            match = re.search(r'(\d+\s*x\s*\d+)', line)
            
            # Check for price (at least one number)
            nums = []
            for w in clean_words:
                try: nums.append(float(w))
                except: pass
            
            if match and len(nums) >= 1:
                data.append({
                    "Category": "Invisi-Gard",
                    "Size": match.group(1),
                    "Price": nums[-1] # Assume last number is price
                })

    return pd.DataFrame(data)

def process_creative_doors():
    base_path = "A Supplier Pricing, Info & Brochures (Alex Website)"
    fly_path = os.path.join(base_path, "Creative Doors Fly Screen & Security Door Pricing 2024.pdf")
    invisi_path = os.path.join(base_path, "Creative Doors Invisi-Gard Security Door Pricing 2024.pdf")
    
    print("Extracting Flyscreens...")
    df_fly = extract_from_flyscreens(fly_path)
    print(f"Extracted {len(df_fly)} flyscreen items.")
    
    print("Extracting Invisi-Gard...")
    df_invisi = extract_from_invisigard(invisi_path)
    print(f"Extracted {len(df_invisi)} invisi-gard items.")
    
    output_path = "Products/Creative Doors.xlsx"
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        if not df_fly.empty:
            df_fly.to_excel(writer, sheet_name='Flyscreens', index=False)
        if not df_invisi.empty:
            df_invisi.to_excel(writer, sheet_name='Invisi-Gard', index=False)
            
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    process_creative_doors()
