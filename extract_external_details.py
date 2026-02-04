import fitz

pdf_path = "/Users/alexlewis/Desktop/APPBUILDSANTIGRAVITY/MCB_Sales/A Supplier Pricing, Info & Brochures (Alex Website)/Creative External Blinds Pricing 07July2025.pdf"
doc = fitz.open(pdf_path)

print("Checking for Group-02...")
for i, page in enumerate(doc):
    text = page.get_text("text")
    if "Group-02" in text or "Group 2" in text:
        print(f"FOUND Group 2 on Page {i+1}")
    if "Group-03" in text or "Group 3" in text:
        print(f"FOUND Group 3 on Page {i+1}")

print("\nExtracting Standard Features & Extras...")
# Pages with 'Standard features' based on analysis: 7, 9, 11, 13, 15
feature_pages = [6, 8, 10, 12, 14] # 0-indexed
for p_idx in feature_pages:
    page = doc[p_idx]
    text = page.get_text("text")
    print(f"--- Page {p_idx+1} Content ---")
    print(text[:1000]) # First 1000 chars

print("\nExtracting Motors (Page 5 & 6)...")
for p_idx in [4, 5]:
    page = doc[p_idx]
    print(f"--- Page {p_idx+1} Motors ---")
    print(page.get_text("text"))
