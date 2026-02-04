import fitz

pdf_path = "/Users/alexlewis/Desktop/APPBUILDSANTIGRAVITY/MCB_Sales/A Supplier Pricing, Info & Brochures (Alex Website)/Creative External Blinds Pricing 07July2025.pdf"
doc = fitz.open(pdf_path)

page = doc[9] # Page 10 (index 9)
print(page.get_text("text"))
