import fitz

def dump_venetians_text():
    pdfs = [
        ("A Supplier Pricing, Info & Brochures (Alex Website)/NBS Aluminium Venetians 25mm & 50mm Pricing Mar2025.pdf", "nbs_alu_venetians_text.txt"),
        ("A Supplier Pricing, Info & Brochures (Alex Website)/NBS PVC Venetian (Tuscany) Pricing Mar2025.pdf", "nbs_pvc_venetians_text.txt"),
        ("A Supplier Pricing, Info & Brochures (Alex Website)/NBS Woodlike Venetians (Urbanwood) Mar2025.pdf", "nbs_woodlike_venetians_text.txt"),
    ]
    
    for pdf_path, output_file in pdfs:
        try:
            doc = fitz.open(pdf_path)
            with open(output_file, "w") as f:
                for i, page in enumerate(doc):
                    text = page.get_text("text")
                    f.write(f"--- Page {i+1} ---\n")
                    f.write(text)
                    f.write("\n\n")
            print(f"Text dumped to {output_file}")
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")

if __name__ == "__main__":
    dump_venetians_text()
