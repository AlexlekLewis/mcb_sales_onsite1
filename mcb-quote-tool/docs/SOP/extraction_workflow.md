# Standard Operating Procedure: Product Data Extraction

## Phase 1: content Discovery & Gap Analysis
**Goal:** specific what is in the document vs what is currently in the database to identify gaps.

1.  **Scan Document**: Read the full PDF (text extraction).
2.  **Generate Verification Manifest**: Create a `[product]_manifest.md` listing:
    *   **Page-by-Page Inventory**: What is on each page?
    *   **Status Flags**: ✅ Extracted / ❌ Missed / ⚠️ Partial.
    *   **Missing Critical Data**: Identify specific gaps (e.g., "Builder Range", "Component Options", "Fabric Groups").
3.  **User Review**: User verifies the manifest to ensure nothing subtle (fine print, specific constraints) was missed.

## Phase 2: Comprehensive Extraction
**Goal:** Convert PDF content into structured Markdown artifacts.

1.  **Create Extraction Artifacts**:
    *   `[product]_full_extraction.md`: General info, warranty, components, motors, table of contents.
    *   `[product]_fabrics.md`: Complete list of fabrics mapped to price groups.
    *   `[product]_pricing.md`: Detailed pricing grids and tables.
2.  **Verify Data Integrity**: Check extracted grids against PDF visually.

## Phase 3: Database Implementation
**Goal:** Update the application database with the verified structure.

1.  **Refine Schema (if needed)**: If new data types (e.g., "Component Constraints") are found, propose schema updates.
2.  **Generate Update Script**: Create a TypeScript script (`scripts/update_[product].ts`) using the `SUPABASE_SERVICE_ROLE_KEY`.
    *   *Why Script?* Bypasses Row-Level Security (RLS) constraints and allows complex validation before insert.
3.  **Execute & Validate**: Run script, then verifying inside the MCB Quote Tool app (e.g., check dropdowns, calculated prices).
