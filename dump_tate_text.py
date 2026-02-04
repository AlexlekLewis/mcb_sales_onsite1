import fitz

def dump_tate_text():
    pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/Tate Volitakis Installation Rates Pricing 01Nov2025.pdf"
    doc = fitz.open(pdf_path)
    
    with open("tate_volitakis_text.txt", "w") as f:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
            
    print("Text dumped to tate_volitakis_text.txt")

if __name__ == "__main__":
    dump_tate_text()
