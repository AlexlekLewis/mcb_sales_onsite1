#!/usr/bin/env python3
"""
Fabric Database Audit Script
Parses all fabric grouping tables from Creative Internal Blinds PDF text,
queries the Supabase DB, and produces a full discrepancy report.
"""

import os
import re
import json
from collections import defaultdict

# --- CONFIGURATION ---
TEXT_FILE = "creative_internal_text.txt"
CURTAINS_TEXT_FILE = "creative_curtains_text.txt"

# Supabase DB data (pre-fetched) - we'll embed the DB data directly
# since we can compare without a live connection

# --- PDF PARSING ---

def parse_fabric_grouping_table(lines, start_idx, end_idx):
    """
    Parse a fabric grouping table from PDF text lines.
    
    The format is blocks of 6 lines repeating:
    No. (number)
    Group (number)
    Fabric Type (Screen/Light Filter/Block Out/Sheer)
    Fabric Name
    Supplier
    Width (m)
    """
    fabrics = []
    i = start_idx
    
    # Skip header lines (No., Group, Fabric Type, Fabric, Supplier, W (m))
    # and any page breaks
    
    while i < end_idx:
        line = lines[i].strip()
        
        # Skip empty lines, page breaks, headers, and metadata
        if not line or line.startswith('---') or line.startswith('No.') or \
           line.startswith('July') or line.startswith('Creative Wholesale') or \
           line.startswith('GST') or line in ('Group', 'Fabric Type', 'Fabric', 'Supplier', 'W (m)'):
            i += 1
            continue
        
        # Try to parse a row number (start of a fabric entry)
        try:
            row_num = int(line)
        except ValueError:
            i += 1
            continue
        
        # We found a row number. Next lines should be:
        # Group, Fabric Type, Fabric Name, Supplier, Width
        if i + 5 > end_idx:
            break
            
        try:
            group = int(lines[i + 1].strip())
        except ValueError:
            i += 1
            continue
        
        fabric_type = lines[i + 2].strip()
        fabric_name = lines[i + 3].strip()
        supplier = lines[i + 4].strip()
        width = lines[i + 5].strip()
        
        # Validate - fabric_type should be one of the known types
        valid_types = ['Screen', 'Light Filter', 'Block Out', 'Sheer']
        if fabric_type not in valid_types:
            i += 1
            continue
        
        fabrics.append({
            'row': row_num,
            'group': group,
            'type': fabric_type,
            'name': fabric_name,
            'supplier': supplier,
            'width': width
        })
        
        i += 6  # Skip to next row
    
    return fabrics


def find_table_boundaries(lines):
    """Find the start and end lines of each fabric grouping table."""
    tables = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        if 'Roller - Fabric Grouping' in stripped or \
           'Roller Blinds - Fabric Grouping' in stripped:
            # The actual data starts on page 14 (before this line in the text)
            # Search backwards for 'No. Group Fabric Type' header
            tables.append(('Roller Blinds', i))
        elif 'Roman Blinds - Fabric Grouping' in stripped:
            tables.append(('Roman Blinds', i))
        elif 'Panel Glides -  Fabric Grouping' in stripped or \
             'Panel Glides - Fabric Grouping' in stripped:
            tables.append(('Panel Glides', i))
    
    return tables


def parse_all_tables(filepath):
    """Parse all fabric grouping tables from the text file."""
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    # The Roller Blinds data actually starts at the header before line 1134
    # Let's find the "No. Group Fabric Type" headers
    header_indices = []
    for i, line in enumerate(lines):
        if line.strip() == 'No. Group Fabric Type':
            header_indices.append(i)
    
    # Find the fabric grouping section titles
    section_titles = {}
    for i, line in enumerate(lines):
        stripped = line.strip()
        if 'Roller - Fabric Grouping' in stripped:
            section_titles[i] = 'Roller Blinds'
        elif 'Roman Blinds - Fabric Grouping' in stripped:
            section_titles[i] = 'Roman Blinds'
        elif 'Panel Glides' in stripped and 'Fabric Grouping' in stripped:
            section_titles[i] = 'Panel Glides'
    
    # Map headers to their section
    # The Roller section has data that spans the headers before "Roller - Fabric Grouping" 
    # line 1134 AND after it (pages 14-17)
    # Roman section starts at line 3795
    # Panel Glides section starts at line 5293
    
    results = {}
    
    # Roller Blinds - from first "No. Group" header near page 14 to Roman section
    # Looking at the data, the first fabric entry starts at line ~932 (page 14 header)
    # and the roller grouping title is at 1134 but data continues after it too
    roller_start = None
    roman_start = None
    panel_start = None
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == 'No. Group Fabric Type':
            # Check context to figure out which section this belongs to
            if roller_start is None and i < 3795:
                roller_start = i
            elif roman_start is None and i > 3790 and i < 5290:
                roman_start = i
            elif panel_start is None and i > 5290:
                panel_start = i
    
    # Parse each section
    if roller_start:
        roller_end = 3795 if roman_start else len(lines)
        roller_fabrics = parse_fabric_grouping_table(lines, roller_start, roller_end)
        results['Roller Blinds'] = roller_fabrics
    
    if roman_start:
        roman_end = 5293 if panel_start else len(lines)
        roman_fabrics = parse_fabric_grouping_table(lines, roman_start, roman_end) 
        results['Roman Blinds'] = roman_fabrics
    
    if panel_start:
        panel_fabrics = parse_fabric_grouping_table(lines, panel_start, len(lines))
        results['Panel Glides'] = panel_fabrics
    
    return results


def parse_curtains_fabrics(filepath):
    """Parse fabric data from curtains text file if it exists."""
    if not os.path.exists(filepath):
        return {}
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Look for fabric grouping patterns in curtains
    fabrics = []
    # Curtains text might have different structure, check for group patterns
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'group' in line.lower() and 'fabric' in line.lower():
            fabrics.append(f"  Line {i+1}: {line.strip()}")
    
    return {'headers_found': fabrics}


# --- DB DATA (embedded from Supabase query) ---
# This is the full fabric data from the DB for Creative Internal Blinds

DB_FABRICS = [
    # Group 1
    {"name": "Bancoora B/O", "price_group": "1", "brand": "4-Families"},
    {"name": "Chatsworth LF", "price_group": "1", "brand": "Shaw"},
    {"name": "Focus B/O", "price_group": "1", "brand": "Texstyle"},
    {"name": "Focus Roller", "price_group": "1", "brand": "Texstyle"},
    {"name": "Kleenscreen", "price_group": "1", "brand": "Texstyle"},
    {"name": "Sanctuary LF", "price_group": "1", "brand": "Texstyle"},
    {"name": "Vibe B/O", "price_group": "1", "brand": "Shaw"},
    {"name": "Vibe Roller", "price_group": "1", "brand": "Shaw"},
    # Group 2
    {"name": "Aventus 10%", "price_group": "2", "brand": "Shaw"},
    {"name": "Aventus 5%", "price_group": "2", "brand": "Shaw"},
    {"name": "Balmoral B/O Roller", "price_group": "2", "brand": "Texstyle"},
    {"name": "Balmoral LF", "price_group": "2", "brand": "Texstyle"},
    {"name": "Barbados B/O", "price_group": "2", "brand": "Texstyle"},
    {"name": "Cascata B/O", "price_group": "2", "brand": "Texstyle"},
    {"name": "Dakota", "price_group": "2", "brand": "Texstyle"},
    {"name": "Dawn", "price_group": "2", "brand": "Uniline"},
    {"name": "Duo B/O", "price_group": "2", "brand": "Shaw"},
    {"name": "Duo B/O (new)", "price_group": "2", "brand": "Shaw"},
    {"name": "Duo Screen", "price_group": "2", "brand": "Shaw"},
    {"name": "Evolution", "price_group": "2", "brand": "Uniline"},
    {"name": "Hampton Blockout", "price_group": "2", "brand": "Uniline"},
    {"name": "Jersey B/O", "price_group": "2", "brand": "Texstyle"},
    {"name": "Josh/ Banes B/O", "price_group": "2", "brand": "CWSB"},
    {"name": "Karma Roller", "price_group": "2", "brand": "Shaw"},
    {"name": "Kew B/O", "price_group": "2", "brand": "Texstyle"},
    {"name": "Le Reve B/O", "price_group": "2", "brand": "Shaw"},
    {"name": "Le Reve LF", "price_group": "2", "brand": "Shaw"},
    {"name": "Mandalay", "price_group": "2", "brand": "Uniline"},
    {"name": "Mantra B/O", "price_group": "2", "brand": "Shaw"},
    {"name": "Mantra LF", "price_group": "2", "brand": "Shaw"},
    {"name": "Metro Shade B/O", "price_group": "2", "brand": "Texstyle"},
    {"name": "Metro Shade LF", "price_group": "2", "brand": "Texstyle"},
    {"name": "Miami B/O Foam Backed", "price_group": "2", "brand": "Uniline"},
    {"name": "Modena/ Valdes B/O", "price_group": "2", "brand": "CWSB"},
    {"name": "New Palm Beach B/O", "price_group": "2", "brand": "Shaw"},
    {"name": "New Palm Beach LF", "price_group": "2", "brand": "Shaw"},
    {"name": "One Block", "price_group": "2", "brand": "Texstyle"},
    {"name": "Pacific/ Samos B/O", "price_group": "2", "brand": "CWSB"},
    {"name": "Pearlised", "price_group": "2", "brand": "Uniline"},
    {"name": "Sanctuary B/O", "price_group": "2", "brand": "Texstyle"},
    {"name": "Sierra B/O", "price_group": "2", "brand": "Uniline"},
    {"name": "Sirocco Blockout", "price_group": "2", "brand": "Uniline"},
    {"name": "Sirocco LF", "price_group": "2", "brand": "Uniline"},
    {"name": "Skye B/O", "price_group": "2", "brand": "Shaw"},
    {"name": "Skye LF", "price_group": "2", "brand": "Shaw"},
    {"name": "Solitaire B/O Roller", "price_group": "2", "brand": "Texstyle"},
    {"name": "Sunset", "price_group": "2", "brand": "Uniline"},
    {"name": "Tapestry B/O", "price_group": "2", "brand": "Uniline"},
    {"name": "Tapestry LF", "price_group": "2", "brand": "Uniline"},
    {"name": "Vibe Roller Metallic", "price_group": "2", "brand": "Shaw"},
    {"name": "Vivid Block", "price_group": "2", "brand": "Texstyle"},
    # Group 3
    {"name": "Avilla B/O", "price_group": "3", "brand": "H.Douglas"},
    {"name": "Barrier Reef B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Belice B/O", "price_group": "3", "brand": "Uniline"},
    {"name": "Boston B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Broome Blind B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Buxton B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Chatsworth B/O", "price_group": "3", "brand": "Shaw"},
    {"name": "Chester B/O", "price_group": "3", "brand": "H.Douglas"},
    {"name": "Concord B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Daintree B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Gala B/O", "price_group": "3", "brand": "Texstyle"},
    {"name": "Husk II Sheer Blind", "price_group": "3", "brand": "Wilsons"},
    {"name": "Icon FR", "price_group": "3", "brand": "Shaw"},
    {"name": "Linesque B/O", "price_group": "3", "brand": "Shaw"},
    {"name": "Mercury II B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Petra B/O", "price_group": "3", "brand": "H.Douglas"},
    {"name": "Plaza Plus Roller", "price_group": "3", "brand": "H.Douglas"},
    {"name": "Sensory Sheer Blind", "price_group": "3", "brand": "Wilsons"},
    {"name": "Sydney B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Thredbo B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Thredbo LF", "price_group": "3", "brand": "Wilsons"},
    {"name": "Tuscany Blind B/O", "price_group": "3", "brand": "Wilsons"},
    {"name": "Tuscany Blind LF", "price_group": "3", "brand": "Wilsons"},
    {"name": "Uluru LF", "price_group": "3", "brand": "Wilsons"},
    # Group 4
    {"name": "Baltic Plus LF", "price_group": "4", "brand": "H.Douglas"},
    # Builder
    {"name": "Kleenscreen (Builder Range)", "price_group": "builder", "brand": "Texstyle"},
    {"name": "Quest Blockout", "price_group": "builder", "brand": "Shaw"},
    {"name": "Quest", "price_group": "Builder Range", "brand": "Shaw"},
]

# DB Curtains fabrics
DB_CURTAINS = [
    {"name": "Alsace", "price_group": "1", "brand": "Slender Morris"},
    {"name": "Aspen", "price_group": "1", "brand": "Hoad"},
    {"name": "Bali", "price_group": "1", "brand": "Nettex"},
    {"name": "Cannes", "price_group": "1", "brand": "Nettex"},
    {"name": "Coco", "price_group": "1", "brand": "Nettex"},
    {"name": "Dynamo (3P lining)", "price_group": "1", "brand": "Nettex"},
    {"name": "Flaxen", "price_group": "1", "brand": "Hoad"},
    {"name": "Horizon", "price_group": "1", "brand": "Nettex"},
    {"name": "Icon", "price_group": "1", "brand": "Hoad"},
    {"name": "Lucern", "price_group": "1", "brand": "Nettex"},
    {"name": "Mikado", "price_group": "1", "brand": "Nettex"},
    {"name": "Milan", "price_group": "1", "brand": "Slender Morris"},
    {"name": "Monaco", "price_group": "1", "brand": "Slender Morris"},
    {"name": "Montreaux", "price_group": "1", "brand": "Nettex"},
    {"name": "Omni", "price_group": "1", "brand": "Charles Parsons"},
    {"name": "Osaka", "price_group": "1", "brand": "Nettex"},
    {"name": "Ski", "price_group": "1", "brand": "Hoad"},
    {"name": "Sumo", "price_group": "1", "brand": "Nettex"},
    {"name": "Verne", "price_group": "1", "brand": "Nettex"},
    {"name": "Vevey", "price_group": "1", "brand": "Nettex"},
    # Duplicates with 'Group X' format
    {"name": "Horizon", "price_group": "Group 1", "brand": "Nettex"},
    {"name": "Galaxy", "price_group": "Group 2", "brand": "Hoad"},
    # Group 2
    {"name": "Altitude", "price_group": "2", "brand": "Nettex"},
    {"name": "Astra", "price_group": "2", "brand": "Hoad"},
    {"name": "Belmont", "price_group": "2", "brand": "Hoad"},
    {"name": "Cloud", "price_group": "2", "brand": "Hoad"},
    {"name": "Easton", "price_group": "2", "brand": "Basford"},
    {"name": "Epic", "price_group": "2", "brand": "Nettex"},
    {"name": "euphoric", "price_group": "2", "brand": "Nettex"},
    {"name": "Galaxy", "price_group": "2", "brand": "Nettex"},
    {"name": "Galaxy", "price_group": "2", "brand": "Hoad"},
    {"name": "Horizon", "price_group": "2", "brand": "Hoad"},
    {"name": "Mondo", "price_group": "2", "brand": "Hoad"},
    {"name": "Odin", "price_group": "2", "brand": "Basford"},
    {"name": "Summer", "price_group": "2", "brand": "Hoad"},
    {"name": "Venus", "price_group": "2", "brand": "Hoad"},
    {"name": "Virgo", "price_group": "2", "brand": "Hoad"},
    # Group 3-5
    {"name": "Daintree", "price_group": "3", "brand": "Hoad"},
    {"name": "Genoa", "price_group": "3", "brand": "Warwick"},
    {"name": "Gianna", "price_group": "3", "brand": "Warwick"},
    {"name": "Sicily", "price_group": "3", "brand": "Warwick"},
    {"name": "Verona", "price_group": "3", "brand": "Hoad"},
    {"name": "Chios", "price_group": "4", "brand": "Warwick"},
    {"name": "Corfu", "price_group": "4", "brand": "Warwick"},
    {"name": "Mossman", "price_group": "4", "brand": "Hoad"},
    {"name": "Burano", "price_group": "5", "brand": "Warwick"},
    {"name": "Encore", "price_group": "5", "brand": "Hoad"},
    {"name": "Lafayette", "price_group": "5", "brand": "Nettex"},
    {"name": "Napoleon", "price_group": "5", "brand": "Nettex"},
    {"name": "Sencha", "price_group": "5", "brand": "James Dunlop"},
    {"name": "Weylands", "price_group": "5", "brand": "Basford"},
]


def normalize_name(name):
    """Normalize fabric name for comparison."""
    n = name.strip()
    # Remove trailing whitespace and normalize spaces
    n = re.sub(r'\s+', ' ', n)
    return n


def compare_roller_with_db(pdf_roller, db_fabrics):
    """Compare Roller Blinds grouping from PDF with DB data."""
    issues = []
    
    # Build lookup from PDF
    pdf_lookup = {}
    for f in pdf_roller:
        pdf_lookup[normalize_name(f['name'])] = f
    
    # Build lookup from DB
    db_lookup = {}
    for f in db_fabrics:
        db_lookup[normalize_name(f['name'])] = f
    
    # Check each PDF fabric against DB
    for pdf_name, pdf_data in sorted(pdf_lookup.items()):
        pdf_group = str(pdf_data['group'])
        
        # Try to find in DB (exact match first, then fuzzy)
        db_entry = db_lookup.get(pdf_name)
        
        if not db_entry:
            # Try fuzzy matching
            best_match = None
            for db_name in db_lookup:
                # Check if one is substring of the other
                if pdf_name.lower() in db_name.lower() or db_name.lower() in pdf_name.lower():
                    best_match = db_name
                    break
            
            if best_match:
                db_entry = db_lookup[best_match]
                issues.append({
                    'type': 'NAME_MISMATCH',
                    'pdf_name': pdf_name,
                    'db_name': best_match,
                    'pdf_group': pdf_group,
                    'db_group': db_entry['price_group'],
                    'severity': 'WARNING'
                })
            else:
                issues.append({
                    'type': 'MISSING_IN_DB',
                    'pdf_name': pdf_name,
                    'pdf_group': pdf_group,
                    'pdf_supplier': pdf_data['supplier'],
                    'severity': 'ERROR'
                })
                continue
        
        # Check group match
        db_group = db_entry['price_group'].replace('Group ', '')
        if pdf_group != db_group:
            issues.append({
                'type': 'GROUP_MISMATCH',
                'name': pdf_name,
                'pdf_group': pdf_group,
                'db_group': db_entry['price_group'],
                'severity': 'ERROR'
            })
    
    # Check for DB fabrics not in PDF
    for db_name, db_data in sorted(db_lookup.items()):
        if db_name not in pdf_lookup:
            # Check fuzzy
            found = False
            for pdf_name in pdf_lookup:
                if pdf_name.lower() in db_name.lower() or db_name.lower() in pdf_name.lower():
                    found = True
                    break
            if not found:
                issues.append({
                    'type': 'EXTRA_IN_DB',
                    'db_name': db_name,
                    'db_group': db_data['price_group'],
                    'db_brand': db_data['brand'],
                    'severity': 'WARNING'
                })
    
    return issues


def check_format_issues(fabrics, label):
    """Check for format inconsistencies in price_group values."""
    issues = []
    for f in fabrics:
        pg = f['price_group']
        if re.match(r'^Group \d+$', pg):
            issues.append({
                'type': 'FORMAT_INCONSISTENCY',
                'name': f['name'],
                'price_group': pg,
                'expected': pg.replace('Group ', ''),
                'product': label,
                'severity': 'WARNING'
            })
        elif pg == 'Builder Range':
            # Check if there's also a 'builder' version
            issues.append({
                'type': 'FORMAT_INCONSISTENCY',
                'name': f['name'],
                'price_group': pg,
                'expected': 'builder',
                'product': label,
                'severity': 'WARNING'
            })
    return issues


def check_duplicates(fabrics, label):
    """Check for duplicate fabric entries."""
    issues = []
    seen = defaultdict(list)
    for f in fabrics:
        key = f['name'].lower()
        seen[key].append(f)
    
    for name_lower, entries in seen.items():
        if len(entries) > 1:
            groups = [e['price_group'] for e in entries]
            brands = [e['brand'] for e in entries]
            issues.append({
                'type': 'DUPLICATE',
                'name': entries[0]['name'],
                'count': len(entries),
                'groups': groups,
                'brands': brands,
                'product': label,
                'severity': 'ERROR' if len(set(groups)) > 1 else 'WARNING'
            })
    
    return issues


def generate_report():
    """Generate the full audit report."""
    print("=" * 80)
    print("FABRIC DATABASE AUDIT REPORT")
    print("=" * 80)
    print()
    
    # Parse PDF data
    all_tables = parse_all_tables(TEXT_FILE)
    
    for product_type, fabrics in all_tables.items():
        print(f"\n📋 PDF: {product_type} — {len(fabrics)} fabrics found")
        groups = defaultdict(int)
        for f in fabrics:
            groups[f['group']] += 1
        for g in sorted(groups.keys()):
            print(f"   Group {g}: {groups[g]} fabrics")
    
    print()
    print("=" * 80)
    print("1. CREATIVE INTERNAL BLINDS — ROLLER BLINDS vs DB")
    print("=" * 80)
    
    roller_fabrics = all_tables.get('Roller Blinds', [])
    issues = compare_roller_with_db(roller_fabrics, DB_FABRICS)
    
    if not issues:
        print("✅ No discrepancies found!")
    else:
        errors = [i for i in issues if i['severity'] == 'ERROR']
        warnings = [i for i in issues if i['severity'] == 'WARNING']
        
        if errors:
            print(f"\n❌ ERRORS ({len(errors)}):")
            for issue in errors:
                if issue['type'] == 'GROUP_MISMATCH':
                    print(f"   🔴 GROUP MISMATCH: '{issue['name']}' — PDF: Group {issue['pdf_group']}, DB: {issue['db_group']}")
                elif issue['type'] == 'MISSING_IN_DB':
                    print(f"   🔴 MISSING IN DB: '{issue['pdf_name']}' (PDF Group {issue['pdf_group']}, Supplier: {issue['pdf_supplier']})")
        
        if warnings:
            print(f"\n⚠️  WARNINGS ({len(warnings)}):")
            for issue in warnings:
                if issue['type'] == 'NAME_MISMATCH':
                    extra = ""
                    if issue['pdf_group'] != issue['db_group'].replace('Group ', ''):
                        extra = f" ⚠️  ALSO GROUP DIFF: PDF={issue['pdf_group']}, DB={issue['db_group']}"
                    print(f"   🟡 NAME DIFFER: PDF='{issue['pdf_name']}' vs DB='{issue['db_name']}'{extra}")
                elif issue['type'] == 'EXTRA_IN_DB':
                    print(f"   🟡 NOT IN PDF (Roller): DB has '{issue['db_name']}' in group {issue['db_group']} ({issue['db_brand']})")
    
    # Check for DB entries not in Roller PDF but possibly in other tables
    print()
    print("=" * 80)
    print("2. CROSS-PRODUCT GROUP DIFFERENCES (Roller vs Roman vs Panel)")
    print("=" * 80)
    
    # Build lookups for each product type
    product_lookups = {}
    for product_type, fabrics in all_tables.items():
        lookup = {}
        for f in fabrics:
            lookup[normalize_name(f['name'])] = f['group']
        product_lookups[product_type] = lookup
    
    # Find fabrics that appear in multiple products with different groups
    all_fabric_names = set()
    for lookup in product_lookups.values():
        all_fabric_names.update(lookup.keys())
    
    cross_diffs = []
    for name in sorted(all_fabric_names):
        groups_by_product = {}
        for product_type, lookup in product_lookups.items():
            if name in lookup:
                groups_by_product[product_type] = lookup[name]
        
        if len(groups_by_product) > 1:
            unique_groups = set(groups_by_product.values())
            if len(unique_groups) > 1:
                cross_diffs.append((name, groups_by_product))
    
    if cross_diffs:
        print(f"\n⚠️  {len(cross_diffs)} fabrics have DIFFERENT groups across product types:")
        for name, groups in cross_diffs:
            parts = [f"{pt}: Grp {g}" for pt, g in groups.items()]
            print(f"   '{name}' — {', '.join(parts)}")
    else:
        print("\n✅ All shared fabrics have consistent groups across products")
    
    # Fabrics only in specific products
    print(f"\n📋 Fabrics UNIQUE to each product type:")
    for product_type, lookup in product_lookups.items():
        unique = set(lookup.keys())
        for other_type, other_lookup in product_lookups.items():
            if other_type != product_type:
                unique -= set(other_lookup.keys())
        if unique:
            print(f"\n   {product_type} only ({len(unique)}):")
            for name in sorted(unique):
                print(f"     - {name} (Group {lookup[name]})")
    
    print()
    print("=" * 80)
    print("3. FORMAT INCONSISTENCIES IN DB")
    print("=" * 80)
    
    format_issues = check_format_issues(DB_FABRICS, 'Internal Blinds')
    format_issues.extend(check_format_issues(DB_CURTAINS, 'Curtains'))
    
    if format_issues:
        print(f"\n⚠️  {len(format_issues)} format issues found:")
        for issue in format_issues:
            print(f"   [{issue['product']}] '{issue['name']}' — price_group='{issue['price_group']}' should be '{issue['expected']}'")
    else:
        print("\n✅ No format inconsistencies")
    
    print()
    print("=" * 80)
    print("4. DUPLICATE FABRIC ENTRIES IN DB")
    print("=" * 80)
    
    dup_issues = check_duplicates(DB_FABRICS, 'Internal Blinds')
    dup_issues.extend(check_duplicates(DB_CURTAINS, 'Curtains'))
    
    if dup_issues:
        print(f"\n⚠️  {len(dup_issues)} duplicate issues found:")
        for issue in dup_issues:
            print(f"   [{issue['product']}] '{issue['name']}' appears {issue['count']}x — groups: {issue['groups']}, brands: {issue['brands']}")
    else:
        print("\n✅ No duplicates found")


    print()
    print("=" * 80)
    print("5. SUMMARY OF REQUIRED FIXES")
    print("=" * 80)
    
    # Compile all fixes needed
    all_fixes = []
    
    for issue in issues:
        if issue['type'] == 'GROUP_MISMATCH':
            all_fixes.append(f"UPDATE fabrics SET price_group = '{issue['pdf_group']}' WHERE name = '{issue['name']}' AND supplier = 'Creative' AND product_category = 'Internal Blinds';")
        elif issue['type'] == 'MISSING_IN_DB':
            all_fixes.append(f"-- INSERT MISSING: '{issue['pdf_name']}' (Group {issue['pdf_group']}, Supplier: {issue['pdf_supplier']})")
    
    for issue in format_issues:
        all_fixes.append(f"UPDATE fabrics SET price_group = '{issue['expected']}' WHERE name = '{issue['name']}' AND price_group = '{issue['price_group']}' AND supplier = 'Creative';")
    
    if all_fixes:
        print(f"\n{len(all_fixes)} SQL fixes needed:\n")
        for fix in all_fixes:
            print(f"  {fix}")
    else:
        print("\n✅ No fixes needed!")
    
    print()


if __name__ == '__main__':
    generate_report()
