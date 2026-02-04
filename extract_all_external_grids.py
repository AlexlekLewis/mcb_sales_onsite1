import fitz
import json
import re

pdf_path = "/Users/alexlewis/Desktop/APPBUILDSANTIGRAVITY/MCB_Sales/A Supplier Pricing, Info & Brochures (Alex Website)/Creative External Blinds Pricing 07July2025.pdf"
doc = fitz.open(pdf_path)

# Pages map (0-indexed) based on previous analysis
# Recloth: Page 8 (idx 7)
# Auto Awning: Page 10 (idx 9)
# Straight Drop: Page 12 (idx 11)
# Fixed Guide: Page 14 (idx 13)
# Wire Guide: Page 16 (idx 15)
# Veue Zipscreen: Page 19 (idx 18)
# Veue Straight: Page 21 (idx 20)
# Zipscreen Extreme: Page 23 (idx 22)

products = [
    {"name": "Creative Recloth", "page": 7, "category": "External Blinds"},
    {"name": "Creative Auto Awning", "page": 9, "category": "External Blinds"},
    {"name": "Creative Straight Drop (Crank/Strap)", "page": 11, "category": "External Blinds"},
    {"name": "Creative Fixed Guide (Spring)", "page": 13, "category": "External Blinds"},
    {"name": "Creative Wire Guide (Crank)", "page": 15, "category": "External Blinds"},
    {"name": "Creative Veue Zipscreen", "page": 18, "category": "External Blinds"},
    {"name": "Creative Veue Straight Drop", "page": 20, "category": "External Blinds"},
    {"name": "Creative Zipscreen Extreme", "page": 22, "category": "External Blinds"}
]

extracted_data = []

def parse_grid_from_text(text, product_name):
    # Split text into Group blocks
    # Logic: Look for "Group-XX" or "Zip-Group-XX"
    # Or simplified: The text dump follows a specific order.
    # We will look for sequences of numbers.
    # Finding "960" starts the headers.
    
    # This is tricky with plain text.
    # Better to process by pattern matching.
    
    # We'll split the text by "Group-"
    parts = re.split(r'(?:Zip-|StDrop\s-|XZip_|xZip-HB_)?Group-0([1-4])', text)
    # The split result: [Pre, "1", Content1, "2", Content2, ...]
    
    grids = {}
    width_steps = []
    drop_steps = []
    
    # Assuming the first part is headers? No, headers are inside the content.
    # Content structure: 
    # Width \n Drop \n 960 \n 1260 ... \n 5160 \n 900 \n 287 ...
    
    # We skip part 0 (Pre).
    # Iterate pairs: part[i] is group code, part[i+1] is content.
    
    for i in range(1, len(parts), 2):
        group_code = parts[i]
        content = parts[i+1]
        
        # Parse content
        lines = [l.strip() for l in content.split('\n') if l.strip()]
        
        # Find numeric block
        numbers = []
        for line in lines:
            if line.replace('.', '', 1).isdigit():
                numbers.append(float(line))
        
        # Heuristic to separate Headers (Widths) and Rows
        # The first chunk of numbers are Width Steps.
        # Then we hit Drop Steps (usually 900, 1200...) which are smaller/different pattern?
        # Actually, standard grid:
        # Col Headers (Widths)
        # Then Row Header (Drop) -> Prices...
        
        # Widths: [960, 1260, ..., 5160] (Ascending)
        # Check for ascending sequence.
        
        # Veue Zipscreen page 19: 1000, 1200...
        
        current_widths = []
        grid_values = [] # Array of Arrays
        
        # Consume widths
        # We assume Widths always strictly increase.
        # And the first Drop (e.g. 900 or 1000) might be smaller than last Width (5160).
        # But drops also increase.
        # The key is consistency between groups?
        # Let's parse strictly.
        
        # For Auto Awning (Page 10 dump):
        # 960, ... 5160
        # 900 (Drop)
        # Prices...
        # 1200 (Drop)
        # Prices...
        
        # Collect Widths
        # Start from index 0. Keep adding while N > prev.
        # Stop when N < prev? (e.g. 5160 -> 900). Yes.
        
        idx = 0
        w_steps = []
        last_w = -1
        while idx < len(numbers):
            val = numbers[idx]
            if val > last_w:
                w_steps.append(val)
                last_w = val
                idx += 1
            else:
                break
        
        # Now we have Width Steps.
        if i == 1: # Only capture steps from Group 1 (assume consistency)
            width_steps = w_steps
        
        if not w_steps: continue

        # Now processing Rows
        rows = []
        current_drops = []
        
        while idx < len(numbers):
            # Next number is Drop
            drop_val = numbers[idx]
            current_drops.append(drop_val)
            idx += 1
            
            # Next len(w_steps) numbers are Prices
            row_prices = []
            for _ in range(len(w_steps)):
                if idx < len(numbers):
                    row_prices.append(numbers[idx])
                    idx += 1
                else:
                    break
            
            if len(row_prices) == len(w_steps):
                rows.append(row_prices)
        
        if i == 1:
            drop_steps = current_drops
            
        grids[group_code] = rows # [Drop][Width] structure naturally
        
        # Verify orientation
        # My extraction naturally produces [Drop][Width].
        # (Row 1 = Drop 900, Prices for all widths)
        # So grids[group_code] is [Drop][Width].
        
    return {
        "grids": grids,
        "width_steps": width_steps,
        "drop_steps": drop_steps
    }

print("[")
first = True

for prod in products:
    page = doc[prod["page"]]
    text = page.get_text("text")
    data = parse_grid_from_text(text, prod["name"])
    
    obj = {
        "name": prod["name"],
        "category": prod["category"],
        "pricing_data": data
    }
    
    if not first: print(",")
    print(json.dumps(obj))
    first = False

print("]")
