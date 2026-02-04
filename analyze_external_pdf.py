import fitz

pdf_path = "/Users/alexlewis/Desktop/APPBUILDSANTIGRAVITY/MCB_Sales/A Supplier Pricing, Info & Brochures (Alex Website)/Creative External Blinds Pricing 07July2025.pdf"

doc = fitz.open(pdf_path)

print(f"Total Pages: {len(doc)}")

for i, page in enumerate(doc):
    text = page.get_text("text")
    lines = text.split('\n')
    # Print header/title info to guess content
    print(f"--- Page {i+1} ---")
    for line in lines[:10]:
        if line.strip():
            print(line.strip())
    
    # Check for keywords
    if "Auto Awning" in text:
        print("  [Found 'Auto Awning']")
    if "Recloth" in text:
        print("  [Found 'Recloth']")
    if "Motorisation" in text:
        print("  [Found 'Motorisation']")
    if "Group 1" in text:
        print("  [Found 'Group 1']")
