import fitz

def dump_text():
    pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative Doors Invisi-Gard Security Door Pricing 2024.pdf"
    doc = fitz.open(pdf_path)
    
    with open("invisi_gard_text.txt", "w") as f:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
            
    print("Text dumped to invisi_gard_text.txt")

if __name__ == "__main__":
    dump_text()
