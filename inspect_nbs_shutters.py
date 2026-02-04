import fitz
import sys

def inspect_rest(file_path):
    doc = fitz.open(file_path)
    for i in range(5, len(doc)):
        print(f"\n--- Page {i+1} ---")
        text = page = doc[i].get_text("text")
        print(text[:1000])

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect_rest(sys.argv[1])
