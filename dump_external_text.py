import fitz

def dump_external_text():
    pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative External Blinds Pricing 07July2025.pdf"
    doc = fitz.open(pdf_path)
    
    with open("external_blinds_text.txt", "w") as f:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
            
    print("Text dumped to external_blinds_text.txt")

if __name__ == "__main__":
    dump_external_text()
