import fitz
import os

pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative Internal Blinds Pricing 07July2025.pdf"
output_path = "creative_internal_text.txt"

try:
    doc = fitz.open(pdf_path)
    with open(output_path, "w", encoding="utf-8") as f:
        for i, page in enumerate(doc):
            text = page.get_text()
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
    print(f"Saved text to {output_path}")

except Exception as e:
    print(f"Error: {e}")
