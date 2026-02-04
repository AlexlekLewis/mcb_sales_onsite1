import fitz

def dump_flyscreen_text():
    pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/Creative Doors Fly Screen & Security Door Pricing 2024.pdf"
    doc = fitz.open(pdf_path)
    
    with open("flyscreen_security_text.txt", "w") as f:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
            
    print("Text dumped to flyscreen_security_text.txt")

if __name__ == "__main__":
    dump_flyscreen_text()
