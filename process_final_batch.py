import fitz
import pandas as pd
import os
import re

def process_shutter_tech():
    path = "A Supplier Pricing, Info & Brochures (Alex Website)/Shutter Tech Roller Shutter Pricing 01Sept2023.xlsm"
    print(f"Processing {path}...")
    try:
        xls = pd.ExcelFile(path)
        sheets = {}
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            sheets[sheet_name] = df
            print(f"  Loaded sheet: {sheet_name}")
            
        out = "Products/Shutter Tech Roller Shutter.xlsx"
        with pd.ExcelWriter(out, engine='openpyxl') as writer:
            for name, df in sheets.items():
                df.to_excel(writer, sheet_name=name, index=False)
        print(f"Saved {out}")
    except Exception as e:
        print(f"Failed to process Shutter Tech: {e}")

def get_table_from_page(page, headers):
    # Extract rows based on Y-coordinates
    words = page.get_text("words", sort=True)
    rows = {}
    for w in words:
        y = int(w[1])
        if y not in rows: rows[y] = []
        rows[y].sort(key=lambda x: x[0]) # Sort by X
        rows[y].append(w)
        
    sorted_y = sorted(rows.keys())
    
    data = []
    
    # Heuristic: Find rows with prices ($)
    for y in sorted_y:
        line_words = rows[y]
        # Sort by X
        line_words.sort(key=lambda x: x[0])
        
        # Check for prices
        prices = []
        text_parts = []
        
        for w in line_words:
            text = w[4]
            if '$' in text or (text.replace('.', '', 1).isdigit() and float(text) < 1000): # Assuming rates < 1000
                 prices.append(text)
            else:
                 text_parts.append(text)
        
        # If we have prices, assume it's a row
        if len(prices) > 0:
            # Name is text_parts joined
            name = " ".join(text_parts).strip()
            # If name is empty (e.g. continuation line?), skip or merge?
            # If name is reasonable (e.g. "Holland Blind")
            
            # Map prices to headers?
            # We assume prices appear in order of headers (excluding Item Name)
            # headers[0] = "Item"
            # headers[1..] = Price Columns
            
            row_data = {"Item": name}
            for i, p in enumerate(prices):
                if i+1 < len(headers):
                    col = headers[i+1]
                    row_data[col] = p
            data.append(row_data)
            
    return pd.DataFrame(data)

def process_tate():
    path = "A Supplier Pricing, Info & Brochures (Alex Website)/Tate Volitakis Installation Rates Pricing 01Nov2025.pdf"
    print(f"Processing {path}...")
    doc = fitz.open(path)
    
    # Page 1: Internal
    h1 = ["Item", "Base Rate", "Width > 2200", "Height > 3000", "Height > 4000", "Height > 5000"]
    df1 = get_table_from_page(doc[0], h1)
    
    # Page 2: External
    h2 = ["Item", "Base Rate", "Width > 3500", "Width > 5000", "Height > 3500", "Height > 5000"]
    df2 = get_table_from_page(doc[1], h2)
    
    out = "Products/Tate Volitakis Installation Rates.xlsx"
    with pd.ExcelWriter(out, engine='openpyxl') as writer:
        if not df1.empty: df1.to_excel(writer, sheet_name="Internal", index=False)
        if not df2.empty: df2.to_excel(writer, sheet_name="External", index=False)
    print(f"Saved {out}")

if __name__ == "__main__":
    process_shutter_tech()
    process_tate()
