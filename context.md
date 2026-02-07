# Project Context

## Overview
This project is a dual-purpose repository containing:
1.  **Data Extraction Pipeline**: A set of Python scripts for extracting product and pricing data from vendor PDFs and Excel files.
2.  **MCB Quote Tool**: A React-based web application for generating quotes for "Modern Curtains & Blinds" (MCB).

## Tech Stack
### Frontend (mcb-quote-tool)
-   **Framework**: React 19, Vite 7
-   **Routing**: React Router 7
-   **Styling**: TailwindCSS 4, Framer Motion
-   **State Management**: React Hooks (likely Context or Zustand internally if observed)
-   **Backend / Database**: Supabase (PostgreSQL, Auth, Realtime)
-   **PDF Generation**: `@react-pdf/renderer`
-   **Validation**: Zod
-   **Language**: TypeScript

### Data Processing (Root)
-   **Language**: Python
-   **Libraries**: `pandas`, `PyMuPDF` (fitz), `openpyxl`
-   **Purpose**: Parsing vendor price lists (Excel/PDF) into structured formats (JSON/SQL/Clean Excel) to seed the application database.

## Project Structure
-   `/` (Root): Contains Python extraction scripts (`process_*.py`, `extract_*.py`) and raw data mappings.
-   `/mcb-quote-tool`: The main web application directory.
    -   `/src`: Source code.
    -   `/supabase`: Database migrations and configuration.
    -   `/docs`: Documentation and SOPs.

## Core Workflows
1.  **Data Ingestion**: Raw vendor files are processed by Python scripts in the root. These scripts output cleaned data.
2.  **Quote Generation**: The React app allows users to select products (Curtains, Blinds, Shutters, etc.), configure dimensions/extras, and generate a PDF quote.
3.  **Pricing**: Pricing logic handles base rates, tier-based pricing (implied by file names like `process_nbs_batch2.py`), and extra costs.

## Key Terminology
-   **MCB**: Modern Curtains & Blinds (The business).
-   **NBS**: Likely a specific supplier or product range (seen in filenames like `nbs_alu_venetians`).
-   **Tate / Shutter Tech**: External suppliers.
