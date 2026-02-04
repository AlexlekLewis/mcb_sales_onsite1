import fitz
import sys
import os

def inspect_pdf_structure(file_path):
    print(f"--- Inspecting {os.path.basename(file_path)} ---")
    doc = fitz.open(file_path)
    
    for i, page in enumerate(doc):
        print(f"\n--- Page {i+1} ---")
        text = page.get_text("text")
        lines = text.split('\n')
        # Print first 20 lines to see headers/structure
        for line in lines[:20]:
            print(line)
        print("...")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect_pdf_structure(sys.argv[1])
    else:
        print("Usage: python3 inspect_pdf.py <filepath>")
