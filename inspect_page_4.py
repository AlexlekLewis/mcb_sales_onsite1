import fitz
import sys

def inspect_page_4(file_path):
    doc = fitz.open(file_path)
    page = doc[3] # Page 4 is index 3
    
    # Text with simple layout preservation assumption (sort=True)
    text = page.get_text("text", sort=True)
    print("--- Page 4 Content ---")
    print(text)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect_page_4(sys.argv[1])
    else:
        print("Usage: python3 inspect_page_4.py <filepath>")
