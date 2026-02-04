import fitz
import re
import pandas as pd
import os
import sys

def parse_creative_curtains(file_path):
    doc = fitz.open(file_path)
    
    # --- Part 1: Fabric Groups (Pages 2-3) ---
    fabrics = []
    print("--- Parsing Fabrics ---")
    for i in [1, 2]: # Page 2 and 3 (0-indexed)
        page = doc[i]
        text = page.get_text("text")
        lines = text.split('\n')
        
        # Regex for valid fabric line: No. Supplier FabricRange Width Group
        # Example: 1 Charles Parsons Omni 3400 1
        # Example: 36 Hoad Daintree 2900 3
        # We look for lines that end with a single digit (Group) and have a width before it.
        
        for line in lines:
            line = line.strip()
            # Simple heuristic: Ends with digit (Group), Preceded by digit (Width)
            # This is tricky because "Width" might be 2900 or 3400.
            # Let's try to match lines that *look* like table rows.
            
            # Pattern: Start with number, text, number, number
            # But the 'get_text' might split columns into lines.
            pass

    # Better approach for Fabrics: Use 'blocks' to find row alignment or just dump text and assume clean lines?
    # The "text" output in Step 53 showed clean lines:
    # "1  Charles Parsons  Omni  3400  1" -> This appeared as separate lines?
    # Step 53 output:
    # 1
    # Charles Parsons
    # Omni
    # 3400
    # 1
    # Ah! 'get_text("text")' splits columns into newlines if they are far apart visually? 
    # Or maybe the PDF structure is such that each cell is a line.
    
    # If they are separate lines, I need a state machine.
    # State 0: Look for No.
    # State 1: Look for Supplier
    # State 2: Look for Range
    # State 3: Look for Width
    # State 4: Look for Group -> Save -> Reset
    
    parsed_fabrics = []
    current_fabric = {}
    
    # Valid Suppliers for validation
    valid_suppliers = ["Charles Parsons", "Hoad", "Warwick", "James Dunlop", "Zepel", "Filigree", "Basford", "Maurice Kain", "Nettex", "Shaw", "Texstyle", "Wilson", "Four Families"]
    
    for i in [1, 2]:
        page = doc[i]
        words = page.get_text("words", sort=True) 
        # words: (x0, y0, x1, y1, "string", block_no, line_no, word_no)
        
        # This is hard to parse line-by-line with simple iteration if layout is complex.
        # Let's try to group by Y-coordinate (rows).
        
        rows = {}
        for w in words:
            y = round(w[1], 1) # Round Y to group same line
            if y not in rows:
                rows[y] = []
            rows[y].append(w[4])
        
        # Sort rows by Y
        sorted_rows = sorted(rows.keys())
        
        for y in sorted_rows:
            row_words = rows[y]
            # row_words is a list of strings on this line.
            # a valid row usually starts with a Number index.
            if len(row_words) < 5:
                continue
            
            # Check if first item is a number (Index)
            if row_words[0].isdigit():
                # Potential row
                # Example: ['1', 'Charles', 'Parsons', 'Omni', '3400', '1']
                # Last item should be group (1-5)
                # Second to last should be width (number)
                
                try:
                    full_line = " ".join(row_words)
                    # Extract Group (last digit)
                    group = row_words[-1]
                    width = row_words[-2]
                    
                    if not group.isdigit() or not width.isdigit():
                        continue
                        
                    # Extract Supplier and Range
                    # Supplier is row_words[1]... but could be multiple words "Charles Parsons"
                    # Range is between Supplier and Width
                    
                    # Heuristic: Match against known suppliers or explicit structure
                    pass 
                    
                    # Minimal extraction for now
                    parsed_fabrics.append({
                        "id": row_words[0],
                        "raw": full_line,
                        "group": group,
                        "width": width
                    })
                except:
                    continue

    print(f"Parsed {len(parsed_fabrics)} fabrics.")
    if len(parsed_fabrics) > 0:
        print(f"Sample: {parsed_fabrics[0]}")

    # --- Part 2: Pricing (Pages 4-8) ---
    print("\n--- Parsing Prices ---")
    prices = []
    
    for i in range(3, 8): # Pages 4 to 8
        page = doc[i]
        words = page.get_text("words", sort=True)
        
        # Group by Y
        rows = {}
        for w in words:
            y = round(w[1], 1)
            if y not in rows: rows[y] = []
            rows[y].append(w[4])
            
        sorted_rows = sorted(rows.keys())
        
        # Identify Group from page header?
        # The header "Group 01" usually appears at top.
        group_id = f"Group {i-2}" # Heuristic: Page 4->Grp1, Page 5->Grp2...
        
        for y in sorted_rows:
            row_words = rows[y]
            # Valid price row: Width $Price $Price
            # Example: 1.00 $120 $140
            # Clean '$'
            clean_words = [w.replace('$', '').replace(',', '') for w in row_words]
            
            # Check if we have 3 numbers
            # Sometimes parsing might split "$120" into "$" "120" -> handled by replace above
            if len(clean_words) >= 3:
                # Check if first is width (float-like)
                try:
                    width = float(clean_words[0])
                    p1 = float(clean_words[1])
                    p2 = float(clean_words[2])
                    
                    prices.append({
                        "Group": group_id,
                        "Width": width,
                        "Price_100": p1,
                        "Price_160": p2
                    })
                except:
                    continue
                    
    print(f"Parsed {len(prices)} price rows.")
    if len(prices) > 0:
        print(f"Sample: {prices[0]}")
    
    return parsed_fabrics, prices

if __name__ == "__main__":
    if len(sys.argv) > 1:
        parse_creative_curtains(sys.argv[1])
    else:
        print("Usage: <file>")
