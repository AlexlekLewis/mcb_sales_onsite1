import fitz

def dump_text():
    pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative Curtains Pricing Jun25.pdf"
    doc = fitz.open(pdf_path)
    
    with open("creative_curtains_text.txt", "w") as f:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
            
    print("Text dumped to creative_curtains_text.txt")

if __name__ == "__main__":
    dump_text()
