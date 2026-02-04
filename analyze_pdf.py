import fitz  # PyMuPDF
import sys
import os

def analyze_pdf(file_path):
    print(f"--- Analyzing {os.path.basename(file_path)} ---")
    try:
        doc = fitz.open(file_path)
        print(f"Pages: {len(doc)}")
        
        # Extract text from the first page
        page1 = doc[0]
        text = page1.get_text()
        print("First Page Text Snippet:")
        print(text[:1000])  # Print first 1000 chars
        
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        analyze_pdf(file_path)
    else:
        print("Please provide a file path.")
