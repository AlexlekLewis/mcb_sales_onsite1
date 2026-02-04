import fitz

pdf_path = "/Users/alexlewis/Desktop/APPBUILDSANTIGRAVITY/MCB_Sales/A Supplier Pricing, Info & Brochures (Alex Website)/Creative External Blinds Pricing 07July2025.pdf"
doc = fitz.open(pdf_path)

# Pages: Recloth (7/page 8), Auto (9/page 10), Straight (11/page 12), Fixed (13/page 14), Wire (15/page 16)
# Note: 0-indexed. Page 8 is index 7.
pages_of_interest = {
    "Recloth": 7,
    "Auto Awning": 9,
    "Straight Drop": 11,
    "Fixed Guide": 13,
    "Wire Guide": 15
}

for name, idx in pages_of_interest.items():
    print(f"\n--- {name} (Page {idx+1}) ---")
    text = doc[idx].get_text("text")
    lines = text.split('\n')
    # Print first few rows of data to match against DB
    # Looking for numbers like 320, 360, etc.
    count = 0
    for line in lines:
        if any(c.isdigit() for c in line):
            print(line.strip())
            count += 1
            if count > 20: break
