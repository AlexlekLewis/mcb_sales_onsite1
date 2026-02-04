import fitz

def inspect_files():
    base = "A Supplier Pricing, Info & Brochures (Alex Website)"
    
    # 1. Plantation Shutters Check
    shutters = f"{base}/NBS Plantation Shutters Pricing (PVC, Timber & Aluminium) Mar2025.pdf"
    doc1 = fitz.open(shutters)
    print(f"Plantation Shutters Pages: {len(doc1)}")
    
    # 2. PVC Venetian Inspect
    venetian = f"{base}/NBS PVC Venetian (Tuscany) Pricing Mar2025.pdf"
    print(f"--- Inspecting {venetian} ---")
    doc2 = fitz.open(venetian)
    for i, page in enumerate(doc2):
        print(f"\n--- Page {i+1} ---")
        text = page.get_text("text")
        print(text[:1000])

if __name__ == "__main__":
    inspect_files()
