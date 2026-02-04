import fitz

def inspect_page6():
    path = "A Supplier Pricing, Info & Brochures (Alex Website)/NBS Roller Blinds (Blockout & Screens) Mar2025.pdf"
    doc = fitz.open(path)
    page = doc[5] # Page 6
    words = page.get_text("words", sort=True)
    
    # Print first 50 words
    print(f"Total words: {len(words)}")
    print("idx | x0 | y0 | x1 | y1 | text")
    for i, w in enumerate(words[:50]):
        print(f"{i}: {w[0]:.1f}, {w[1]:.1f}, {w[2]:.1f}, {w[3]:.1f}, {w[4]}")

if __name__ == "__main__":
    inspect_page6()
