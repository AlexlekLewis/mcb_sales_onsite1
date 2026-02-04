import pandas as pd
import sys
import os

def analyze_excel(file_path):
    print(f"--- Analyzing {os.path.basename(file_path)} ---")
    try:
        xl = pd.ExcelFile(file_path)
        print(f"Sheet Names: {xl.sheet_names}")
        
        for sheet in xl.sheet_names:
            print(f"\nSheet: {sheet}")
            df = xl.parse(sheet, nrows=5)
            print("First 5 rows:")
            print(df.to_string())
            print("-" * 20)
            
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        analyze_excel(file_path)
    else:
        print("Please provide a file path.")
