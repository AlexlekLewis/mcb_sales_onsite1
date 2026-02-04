import fitz

def dump_honeycomb_text():
    pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/NBS Honeycomb Blinds (Arena) Pricing Mar2025.pdf"
    doc = fitz.open(pdf_path)
    
    with open("nbs_honeycomb_text.txt", "w") as f:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
            
    print("Text dumped to nbs_honeycomb_text.txt")

if __name__ == "__main__":
    dump_honeycomb_text()
