import fitz

def dump_shutters_text():
    pdf_path = "A Supplier Pricing, Info & Brochures (Alex Website)/NBS Plantation Shutters Pricing (PVC, Timber & Aluminium) Mar2025.pdf"
    doc = fitz.open(pdf_path)
    
    with open("nbs_shutters_text.txt", "w") as f:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
            
    print("Text dumped to nbs_shutters_text.txt")

if __name__ == "__main__":
    dump_shutters_text()
