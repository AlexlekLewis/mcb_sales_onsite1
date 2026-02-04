import fitz

def dump_roller_blinds_text():
    pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/NBS Roller Blinds (Blockout & Screens) Mar2025.pdf"
    doc = fitz.open(pdf_path)
    
    with open("nbs_roller_blinds_text.txt", "w") as f:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
            
    print("Text dumped to nbs_roller_blinds_text.txt")

if __name__ == "__main__":
    dump_roller_blinds_text()
