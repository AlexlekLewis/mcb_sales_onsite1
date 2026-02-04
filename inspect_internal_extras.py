import fitz
import os

pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative Internal Blinds Pricing 07July2025.pdf"

if not os.path.exists(pdf_path):
    print(f"File not found: {pdf_path}")
    # Try looking in MCB_Sales if running from root?
    # Based on previous list_dir, the script is in MCB_Sales/mcb-quote-tool? No, the list_dir was on MCB_Sales.
    # Wait, Step 28 list_dir was /Users/alexlewis/Desktop/APPBUILDSANTIGRAVITY/MCB_Sales.
    # And it contained "A Supplier Pricing...".
    # So relative path should be correct if cwd is MCB_Sales.
    pass

try:
    doc = fitz.open(pdf_path)
    print(f"Opened {pdf_path} - {len(doc)} pages")
    
    for i, page in enumerate(doc):
        text = page.get_text()
        # Look for keywords
        if "extra" in text.lower() or "component" in text.lower() or "surcharge" in text.lower():
            print(f"--- Page {i+1} ---")
            # Print lines containing keywords and some context
            lines = text.split('\n')
            for j, line in enumerate(lines):
                if any(k in line.lower() for k in ["extra", "component", "surcharge", "optional", "motor"]):
                    print(f"Line {j}: {line.strip()}")
                    # Print next few lines as they might list the items
                    for k in range(1, 6):
                        if j+k < len(lines):
                            print(f"  + {lines[j+k].strip()}")
            print("\n")
            
except Exception as e:
    print(f"Error: {e}")
