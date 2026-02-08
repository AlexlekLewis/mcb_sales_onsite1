#!/usr/bin/env python3
"""
Comprehensive Internal Blinds Report — NBS & Creative
Covers: Products, Fabrics, Group Pricing, Components, Installation
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime

OUTPUT_PATH = "/Users/alexlewis/Desktop/APPBUILDSANTIGRAVITY/MCB_Sales/Internal_Blinds_Report.pdf"

# ═══════════════════════════════════════════════════════════════
# DATA (from Supabase queries)
# ═══════════════════════════════════════════════════════════════

NBS_PRODUCTS = [
    {"name": "NBS Aluminium Venetian 25mm - Slimline", "pricing_type": "grid", "base_group": 1},
    {"name": "NBS Aluminium Venetian 50mm - Wideline", "pricing_type": "grid", "base_group": 1},
    {"name": "NBS Honeycomb Blind - Arena Standard", "pricing_type": "grid", "base_group": 1},
    {"name": "NBS PVC Venetian - Tuscany", "pricing_type": "grid", "base_group": 1},
    {"name": "NBS Roller Blind - Blockout", "pricing_type": "grid", "base_group": 1},
    {"name": "NBS Roller Blind - Screen", "pricing_type": "grid", "base_group": 1},
    {"name": "NBS Woodlike Venetian - Urbanwood", "pricing_type": "grid", "base_group": 1},
]

NBS_FABRICS = [
    {"name": "Group 1 Generic", "price_group": "Group 1", "brand": "NBS Generic", "product_category": "Internal Blinds"},
    {"name": "Group 2 Generic", "price_group": "Group 2", "brand": "NBS Generic", "product_category": "Internal Blinds"},
    {"name": "Group 3 Generic", "price_group": "Group 3", "brand": "NBS Generic", "product_category": "Internal Blinds"},
    {"name": "Group 4 Generic", "price_group": "Group 4", "brand": "NBS Generic", "product_category": "Internal Blinds"},
    {"name": "Group 5 Generic", "price_group": "Group 5", "brand": "NBS Generic", "product_category": "Internal Blinds"},
]

NBS_HONEYCOMB_FABRICS = [
    {"name": "Clarity Sheer", "brand": "NBS Arena"},
    {"name": "Hadley Blockout", "brand": "NBS Arena"},
    {"name": "Hadley Translucent", "brand": "NBS Arena"},
    {"name": "Harlem Blockout", "brand": "NBS Arena"},
    {"name": "Harlem Translucent", "brand": "NBS Arena"},
    {"name": "Haze Blockout", "brand": "NBS Arena"},
    {"name": "Haze Translucent", "brand": "NBS Arena"},
    {"name": "Henley Blockout", "brand": "NBS Arena"},
    {"name": "Henley Translucent", "brand": "NBS Arena"},
    {"name": "Kinship Translucent", "brand": "NBS Arena"},
]

NBS_EXTRAS = {
    "General": [
        {"name": "Crochet Pull Rings", "price": "$4.60", "type": "fixed"},
        {"name": "Extra Long Chain (> 3000mm)", "price": "$6.00", "type": "fixed"},
        {"name": "Gold/Silver Rings", "price": "$4.60", "type": "fixed"},
        {"name": "Tassle", "price": "$7.80", "type": "fixed"},
    ],
    "Hardware": [
        {"name": "Compact Double Bracket Kit", "price": "$15.50", "type": "fixed"},
        {"name": "Double Bracket Covers", "price": "$6.05", "type": "fixed"},
        {"name": "Heavy Duty 63mm Tube", "price": "$11.00", "type": "/m width"},
        {"name": "Helper Spring Upgrade (Direct Drive)", "price": "$28.35", "type": "fixed"},
        {"name": "Helper Spring/Spring Assist", "price": "$33.25", "type": "fixed"},
        {"name": "Multi-Link / Inline Link", "price": "$35.50", "type": "fixed"},
        {"name": "Single Bracket Covers 40mm", "price": "$1.50", "type": "fixed"},
        {"name": "Stainless Steel Chain", "price": "$14.40", "type": "fixed"},
        {"name": "Tube Adaptors (for upgrade)", "price": "$3.80", "type": "fixed"},
        {"name": "Tube Upgrade 50mm (< 2100mm)", "price": "$6.00", "type": "/m width"},
        {"name": "Universal Link 0-75° Set", "price": "$148.00", "type": "fixed"},
        {"name": "Vertical BR-BR Double Bracket Kit", "price": "$17.10", "type": "fixed"},
    ],
    "Motorisation": [
        {"name": "Zero Gravity (Chain Control)", "price": "$46.00", "type": "fixed"},
        {"name": "Zero Gravity (Chainless/Motor)", "price": "$65.60", "type": "fixed"},
    ],
    "Options": [
        {"name": "Rubber Insert for Bottom Rail", "price": "$1.70", "type": "/m width"},
        {"name": "Side Hems (Light Filter)", "price": "$18.00", "type": "fixed"},
        {"name": "Wrapped Bottom Rail", "price": "$15.75", "type": "/m width"},
    ],
    "Pelmets & Valances": [
        {"name": "Fabric Wrapping (100mm/Curved)", "price": "$18.90", "type": "/m width"},
        {"name": "Linea Valance 140mm", "price": "$51.00", "type": "/m width"},
        {"name": "Linea Valance 98mm", "price": "$36.00", "type": "/m width"},
        {"name": "Linea Valance Bonded/Railroaded", "price": "$15.00", "type": "/m width"},
        {"name": "Sunboss Fascia 100mm Square", "price": "$38.00", "type": "/m width"},
        {"name": "Sunboss Fascia 75mm Square", "price": "$29.40", "type": "/m width"},
        {"name": "Sunboss Fascia Double Curved", "price": "$47.70", "type": "/m width"},
    ],
    "Surcharges": [
        {"name": "Designer Pricing", "price": "+10%", "type": "percentage"},
        {"name": "Elegant Pricing", "price": "+20%", "type": "percentage"},
        {"name": "Linea Valance Railroading", "price": "+25%", "type": "percentage"},
    ],
}

CREATIVE_PRODUCTS = [
    {"name": "Creative Internal Blinds", "pricing_type": "grid", "base_group": 1,
     "note": "Single product covers Roller Blinds, Roman Blinds, Panel Glides"},
]

CREATIVE_FABRIC_GROUPS = [
    {"group": "Builder Range", "count": 3},
    {"group": "1", "count": 7},
    {"group": "2", "count": 27},
    {"group": "3", "count": 40},
    {"group": "4", "count": 46},
    {"group": "5", "count": 11},
    {"group": "6", "count": 7},
    {"group": "7", "count": 3},
]

# Full fabric list by group
CREATIVE_FABRICS = {
    "Builder Range": [
        ("Kleenscreen (Builder Range)", "Texstyle"),
        ("Quest", "Shaw"),
        ("Quest Blockout", "Shaw"),
    ],
    "1": [
        ("Bancoora B/O", "4-Families"),
        ("Chatsworth LF", "Shaw"),
        ("Focus B/O", "Texstyle"),
        ("Focus Roller", "Texstyle"),
        ("Kleenscreen", "Texstyle"),
        ("Sanctuary LF", "Texstyle"),
        ("Vibe Roller", "Shaw"),
    ],
    "2": [
        ("Aventus 10%", "Shaw"), ("Aventus 5%", "Shaw"), ("Balmoral LF", "Texstyle"),
        ("Cascata B/O", "Texstyle"), ("Dawn", "Uniline"), ("Duo B/O", "Shaw"),
        ("Duo B/O (new)", "Shaw"), ("Duo Screen", "Shaw"), ("Edge B/O (new)", "Shaw"),
        ("GreenAir P05 5%", "CWSB"), ("GreenAir P10 10%", "CWSB"),
        ("Josh/ Banes B/O", "CWSB"), ("Karma Roller", "Shaw"), ("Kew B/O", "Texstyle"),
        ("Metro Shade LF", "Texstyle"), ("Miami B/O Foam Backed", "Uniline"),
        ("Modena/ Valdes B/O", "CWSB"), ("One Block", "Texstyle"), ("One Screen", "Texstyle"),
        ("Pacific/ Samos B/O", "CWSB"), ("Pearlised", "Uniline"), ("Resene B/O", "4-Families"),
        ("Sunset", "Uniline"), ("Uniview Screen 10%", "Uniline"),
        ("Uniview Screen 5%", "Uniline"), ("Vibe B/O", "Shaw"), ("Zen B/O", "H.Douglas"),
    ],
    "3": [
        ("Antigua B/O", "4-Families"), ("Aventus 3%", "Shaw"), ("Avilla B/O", "H.Douglas"),
        ("Balmoral B/O Roller", "Texstyle"), ("Barbados B/O", "Texstyle"),
        ("Belice LF", "Uniline"), ("Bella", "CWSB"), ("Bond B/O", "4-Families"),
        ("Dakota", "Texstyle"), ("Divine", "CWSB"), ("Elegance", "CWSB"),
        ("Finesse", "CWSB"), ("Hampton Blockout", "Uniline"), ("Hampton LF", "Uniline"),
        ("Jersey B/O", "Texstyle"), ("Jersey LF", "Texstyle"), ("Karma B/O", "Shaw"),
        ("Le Reve B/O", "Shaw"), ("Le Reve LF", "Shaw"), ("Mantra B/O", "Shaw"),
        ("Mantra LF", "Shaw"), ("Metro Shade B/O", "Texstyle"),
        ("New Palm Beach B/O", "Shaw"), ("New Palm Beach LF", "Shaw"),
        ("Nishi B/O", "4-Families"), ("Palermo Sheer", "Uniline"),
        ("Plaza Plus Roller", "H.Douglas"), ("Sanctuary B/O", "Texstyle"),
        ("Sierra B/O", "Uniline"), ("Sirocco B/O", "Uniline"),
        ("Sirocco Blockout", "Uniline"), ("Sirocco LF", "Uniline"),
        ("Skye B/O", "Shaw"), ("Skye LF", "Shaw"), ("Solar View", "Texstyle"),
        ("Solitaire B/O Roller", "Texstyle"), ("Tasman B/O", "4-Families"),
        ("Vibe Roller Metallic", "Shaw"), ("Vivid Block", "Texstyle"),
        ("Vivid Shade", "Texstyle"),
    ],
    "4": [
        ("Barrier Reef B/O", "Wilsons"), ("Barrier Reef LF", "Wilsons"),
        ("Belice B/O", "Uniline"), ("Boston B/O", "Wilsons"), ("Boston LF", "Wilsons"),
        ("Broome Blind B/O", "Wilsons"), ("Broome Blind LF", "Wilsons"),
        ("Buxton B/O", "Wilsons"), ("Chatsworth B/O", "Shaw"),
        ("Chester B/O", "H.Douglas"), ("Concord B/O", "Wilsons"), ("Concord LF", "Wilsons"),
        ("Daintree B/O", "Wilsons"), ("Daintree LF", "Wilsons"), ("Duo LF", "Shaw"),
        ("Envirovision", "Shaw"), ("Evolution", "Uniline"), ("Gala B/O", "Texstyle"),
        ("Hampton B/O", "Uniline"), ("Husk II Sheer Blind", "Wilsons"),
        ("Icon FR", "Shaw"), ("Linesque B/O", "Shaw"), ("Linesque LF", "Shaw"),
        ("Longreach LF", "Wilsons"), ("Mandalay", "Uniline"), ("Marley B/O", "Wilsons"),
        ("Mercury II B/O", "Wilsons"), ("Mercury II LF", "Wilsons"),
        ("Noosa LF", "Wilsons"), ("Optima Screen Plus", "H.Douglas"),
        ("Petra B/O", "H.Douglas"), ("Plaza Plus B/O", "H.Douglas"),
        ("Sensory Sheer Blind", "Wilsons"), ("Serengetti LF", "Texstyle"),
        ("St Lucia Sheer", "Wilsons"), ("Sydney B/O", "Wilsons"), ("Sydney LF", "Wilsons"),
        ("Tapestry B/O", "Uniline"), ("Tapestry LF", "Uniline"),
        ("Thredbo B/O", "Wilsons"), ("Thredbo LF", "Wilsons"),
        ("Tuscany Blind B/O", "Wilsons"), ("Tuscany Blind LF", "Wilsons"),
        ("Uluru LF", "Wilsons"), ("Uniview Screen 2%", "Uniline"),
        ("Whitsundays Sheer", "Wilsons"),
    ],
    "5": [
        ("Baltic Plus LF", "H.Douglas"), ("Civic B/O Non-FR (Replace Avila)", "H.Douglas"),
        ("E-Screen - 6% 2x2 (HD Ecoview)", "H.Douglas"),
        ("E-Screen 10% (HD Ecoview)", "H.Douglas"),
        ("Longreach B/O", "Wilsons"), ("M-Screen 1x2 (HD Extraview)", "H.Douglas"),
        ("Noosa B/O", "Wilsons"), ("Scarborough B/O", "H.Douglas"),
        ("Scarborough LF", "H.Douglas"), ("Serengetti B/O", "Texstyle"),
        ("Uluru B/O", "Wilsons"),
    ],
    "6": [
        ("Baltic Plus B/O", "H.Douglas"),
        ("Civic B/O FR (Replace Elements)", "H.Douglas"),
        ("Kenross B/O", "H.Douglas"), ("Kenross LF", "H.Douglas"),
        ("Seychelles Plus B/O", "H.Douglas"),
        ("Spectrum 3% Alu Screen", "Uniline"), ("Willandra LF", "H.Douglas"),
    ],
    "7": [
        ("EnviroTech (HD EcoPlanet)", "H.Douglas"),
        ("M-Screen Deco", "H.Douglas"),
        ("Willandra B/O", "H.Douglas"),
    ],
}

CREATIVE_EXTRAS = {
    "Agencies / Install": [
        {"name": "Bracket Covers", "price": "$3.00", "type": "fixed"},
        {"name": "Chain - Metal / Plastic (< 2.25m)", "price": "$6.00", "type": "fixed"},
        {"name": "Chain Tensioner", "price": "$5.00", "type": "fixed"},
        {"name": "Chain Winder", "price": "$19.00", "type": "fixed"},
        {"name": "D30 Rail - Bubble Seal", "price": "$2.00", "type": "/m width"},
        {"name": "Double Brackets", "price": "$19.00", "type": "fixed"},
        {"name": "Extension Brackets (55mm)", "price": "$7.00", "type": "fixed"},
        {"name": "Spring / Booster (S45)", "price": "$20.00", "type": "fixed"},
        {"name": "Tube Upgrade S45 H/D", "price": "$20.00", "type": "/m width"},
    ],
    "Bonded Blinds": [
        {"name": "Bonded Insert", "price": "$35.00", "type": "/m width"},
        {"name": "Rouched Insert", "price": "$40.00", "type": "/m width"},
    ],
    "Installation": [
        {"name": "Installation", "price": "$60.00", "type": "fixed (nett)"},
        {"name": "Measure Fee", "price": "$70.00", "type": "fixed (nett)"},
    ],
    "Motorisation": [
        {"name": "Altus 28 WireFree Li-Ion", "price": "$192.00", "type": "unit"},
        {"name": "Altus 40 RTS 3/30", "price": "$208.00", "type": "unit"},
        {"name": "Automate Pulse 2 Hub", "price": "$191.00", "type": "unit"},
        {"name": "Connexoon RTS Hub", "price": "$154.00", "type": "unit"},
        {"name": "E6 Motor 6/28", "price": "$144.00", "type": "unit"},
        {"name": "Li-Ion 3.0 Nm Motor", "price": "$265.00", "type": "unit"},
        {"name": "Li-Ion Zero 1.1 Nm Motor", "price": "$191.00", "type": "unit"},
        {"name": "LS 40 3/30 (WT)", "price": "$181.00", "type": "unit"},
        {"name": "M6 Motor 6/28", "price": "$106.00", "type": "unit"},
        {"name": "Push 1 Channel Remote", "price": "$48.00", "type": "unit"},
        {"name": "Push 15 Channel Remote", "price": "$59.00", "type": "unit"},
        {"name": "Push 5 Channel Remote", "price": "$53.00", "type": "unit"},
        {"name": "Situo 1 RTS Remote", "price": "$66.00", "type": "unit"},
        {"name": "Situo 2 RTS Remote", "price": "$78.00", "type": "unit"},
        {"name": "Situo 5 RTS Remote", "price": "$96.00", "type": "unit"},
        {"name": "Solar Panel V2", "price": "$144.00", "type": "unit"},
        {"name": "Sonesse 40 RTS 3/30", "price": "$298.00", "type": "unit"},
    ],
    "Pelmets & Valances": [
        {"name": "Bay Window Join Surcharge", "price": "$12.00", "type": "fixed"},
        {"name": "Bay Window Surcharge", "price": "$12.00", "type": "/corner"},
        {"name": "Cassette 90 Bottom Channel", "price": "$45.00", "type": "/m width"},
        {"name": "Padded Pelmet B/O Surcharge (Grp 4)", "price": "+23%", "type": "percentage"},
        {"name": "Padded Pelmet B/O Surcharge (Grp 5)", "price": "+28%", "type": "percentage"},
        {"name": "Padded Pelmet B/O Surcharge (Grp 6)", "price": "+33%", "type": "percentage"},
        {"name": "Pelmet 95", "price": "Grid", "type": "grid-priced"},
    ],
    "Roman Blinds": [
        {"name": "Angled Soft Roman Surcharge", "price": "+30%", "type": "percentage"},
        {"name": "Cleat (Chrome/Brass)", "price": "$6.00", "type": "fixed"},
        {"name": "Front Batten Surcharge", "price": "+25%", "type": "percentage"},
        {"name": "Headboard Upgrade (MDF)", "price": "$15.00", "type": "/m width"},
        {"name": "Heavy Duty Cord Lock", "price": "$22.00", "type": "fixed"},
        {"name": "Trumpet Barrels (Chrome/Brass)", "price": "$6.00", "type": "fixed"},
    ],
    "Services": [
        {"name": "Cut Back (Screen/Holland)", "price": "$53.00", "type": "fixed"},
        {"name": "Reverse Roll", "price": "$57.00", "type": "fixed"},
        {"name": "Scallop Finish", "price": "+20%", "type": "percentage"},
    ],
}

# ═══════════════════════════════════════════════════════════════
# REPORT GENERATION
# ═══════════════════════════════════════════════════════════════

def create_report():
    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        topMargin=20*mm, bottomMargin=15*mm,
        leftMargin=15*mm, rightMargin=15*mm
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=22, spaceAfter=4*mm, textColor=colors.HexColor('#1a1a2e'))
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#666'), spaceAfter=2*mm, alignment=TA_CENTER)
    h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=16, spaceBefore=8*mm, spaceAfter=4*mm, textColor=colors.HexColor('#0f3460'))
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, spaceBefore=5*mm, spaceAfter=3*mm, textColor=colors.HexColor('#16213e'))
    h3_style = ParagraphStyle('H3', parent=styles['Heading3'], fontSize=11, spaceBefore=3*mm, spaceAfter=2*mm, textColor=colors.HexColor('#333'))
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9, spaceAfter=2*mm, leading=13)
    note_style = ParagraphStyle('Note', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#888'), spaceAfter=2*mm, leading=11)
    warn_style = ParagraphStyle('Warn', parent=body_style, textColor=colors.HexColor('#c44'), backColor=colors.HexColor('#fff5f5'), borderPadding=4)

    story = []

    # ─── TITLE ───
    story.append(Paragraph("Internal Blinds — Database Report", title_style))
    story.append(Paragraph("NBS & Creative Wholesale Blinds", subtitle_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%d %B %Y at %H:%M')}", subtitle_style))
    story.append(Spacer(1, 6*mm))

    # ─── EXECUTIVE SUMMARY ───
    story.append(Paragraph("Executive Summary", h1_style))
    story.append(Paragraph(
        "This report provides a comprehensive overview of both NBS and Creative internal blinds data currently "
        "stored in the MCB SwiftQuote database. It covers the product hierarchy, fabric assignments and price groups, "
        "extras/components, motorisation options, and installation charges for each supplier.",
        body_style
    ))

    summary_data = [
        ['', 'NBS', 'Creative'],
        ['Products', '7', '1 (unified)'],
        ['Fabrics', '5 generic groups + 10 honeycomb', '144 named fabrics'],
        ['Price Groups', 'Group 1–5', 'Builder Range, 1–7'],
        ['Extras Categories', '6', '8'],
        ['Total Extras', '31', '47'],
        ['Motorisation Options', '2', '17'],
        ['Installation', 'Not configured', '$60 install / $70 measure (nett)'],
    ]
    t = Table(summary_data, colWidths=[120, 150, 200])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f3460')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#e8edf5')),
        ('ROWBACKGROUNDS', (1, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fc')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ccc')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)

    # ─── STRUCTURAL OBSERVATIONS ───
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("⚠ Key Structural Observations", h2_style))
    story.append(Paragraph(
        "<b>1. Creative Product Hierarchy:</b> Currently stored as a single product \"Creative Internal Blinds\" "
        "which covers Roller Blinds, Roman Blinds, and Panel Glides. In reality, these are three distinct product "
        "types manufactured by Creative, each with their own pricing grids.",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. Roman Blinds as Extras:</b> Roman Blind components (cleats, headboard upgrades, cord locks) are "
        "stored as extras under the category \"Roman Blinds\". However, Roman Blinds is a product type, not an "
        "extras category. These items should be components of a \"Creative Roman Blinds\" product.",
        body_style
    ))
    story.append(Paragraph(
        "<b>3. NBS Uses Generic Fabrics:</b> NBS Internal Blinds uses 5 generic fabric groups (Group 1–5) rather "
        "than named fabric ranges. This is a simpler model where the fabric choice maps directly to a pricing tier.",
        body_style
    ))
    story.append(Paragraph(
        "<b>4. NBS Missing Installation:</b> NBS does not have Installation or Measure Fee extras configured.",
        body_style
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════
    # SECTION 1: NBS INTERNAL BLINDS
    # ═══════════════════════════════════════════════════
    story.append(Paragraph("1. NBS Internal Blinds", h1_style))

    # Products
    story.append(Paragraph("1.1 Products (7)", h2_style))
    prod_data = [['Product Name', 'Pricing', 'Base Group']]
    for p in NBS_PRODUCTS:
        prod_data.append([p['name'], p['pricing_type'], str(p['base_group'])])
    t = Table(prod_data, colWidths=[280, 80, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c698d')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f6fa')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)

    # Fabrics
    story.append(Paragraph("1.2 Fabrics — Internal Blinds", h2_style))
    story.append(Paragraph("NBS uses generic group names rather than named fabric ranges:", body_style))
    fab_data = [['Fabric Name', 'Price Group', 'Brand']]
    for f in NBS_FABRICS:
        fab_data.append([f['name'], f['price_group'], f['brand']])
    t = Table(fab_data, colWidths=[200, 120, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c698d')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f6fa')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)

    # Honeycomb fabrics
    story.append(Paragraph("1.3 Fabrics — Honeycomb", h2_style))
    story.append(Paragraph("Honeycomb products use named fabric ranges (each fabric is its own price group):", body_style))
    hc_data = [['Fabric Name', 'Brand']]
    for f in NBS_HONEYCOMB_FABRICS:
        hc_data.append([f['name'], f['brand']])
    t = Table(hc_data, colWidths=[250, 190])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c698d')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f6fa')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)

    # NBS Extras
    story.append(Paragraph("1.4 Components & Extras (31 items)", h2_style))
    for cat, items in NBS_EXTRAS.items():
        story.append(Paragraph(f"<b>{cat}</b> ({len(items)} items)", h3_style))
        ext_data = [['Item', 'Price', 'Type']]
        for item in items:
            ext_data.append([item['name'], item['price'], item['type']])
        t = Table(ext_data, colWidths=[250, 80, 110])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3a86a8')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f9fc')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ddd')),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t)

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════
    # SECTION 2: CREATIVE INTERNAL BLINDS
    # ═══════════════════════════════════════════════════
    story.append(Paragraph("2. Creative Internal Blinds", h1_style))

    # Products
    story.append(Paragraph("2.1 Products (1 — Unified)", h2_style))
    story.append(Paragraph(
        "Creative Internal Blinds is stored as a single product. The PDF source (Creative Wholesale Blinds "
        "Pricing July 2025) defines <b>three sub-product types</b> under this umbrella:",
        body_style
    ))
    subprod_data = [
        ['Sub-Product', 'Fabric Groups', 'Has Own Pricing Grid', 'Status'],
        ['Roller Blinds', 'Groups 1–7 + Builder Range', 'Yes', 'Primary product'],
        ['Roman Blinds', 'Groups 1–2', 'Yes (separate grid)', 'Stored as extras category'],
        ['Panel Glides', 'Groups 3–6', 'Yes (separate grid)', 'Not explicitly represented'],
    ]
    t = Table(subprod_data, colWidths=[100, 140, 120, 110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e64c3c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fdf2f0')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)
    story.append(Paragraph(
        "<i>⚠ Recommendation: Split into 3 separate products — Creative Roller Blinds, Creative Roman Blinds, "
        "Creative Panel Glides — each with their own pricing grid, fabric subset, and relevant components.</i>",
        warn_style
    ))

    # Fabrics summary
    story.append(Paragraph("2.2 Fabrics — Group Summary (144 total)", h2_style))
    grp_data = [['Price Group', 'Count', 'Primary Brands']]
    brand_by_group = {}
    for grp, fabrics in CREATIVE_FABRICS.items():
        brands = sorted(set(b for _, b in fabrics))
        brand_by_group[grp] = brands
        grp_data.append([f"Group {grp}" if grp not in ['Builder Range'] else grp, str(len(fabrics)), ", ".join(brands[:4]) + ("..." if len(brands) > 4 else "")])
    t = Table(grp_data, colWidths=[100, 50, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e64c3c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fdf2f0')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)

    # Full fabric listing per group
    story.append(PageBreak())
    story.append(Paragraph("2.3 Fabrics — Full Listing by Group", h2_style))
    for grp in ['Builder Range', '1', '2', '3', '4', '5', '6', '7']:
        fabrics = CREATIVE_FABRICS[grp]
        label = f"Group {grp}" if grp != 'Builder Range' else grp
        story.append(Paragraph(f"<b>{label}</b> — {len(fabrics)} fabrics", h3_style))
        fab_data = [['Fabric Name', 'Brand']]
        for name, brand in fabrics:
            fab_data.append([name, brand])
        t = Table(fab_data, colWidths=[300, 140])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#c0392b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fcf0ef')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ddd')),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t)
        story.append(Spacer(1, 2*mm))

    # Creative Extras
    story.append(PageBreak())
    story.append(Paragraph("2.4 Components, Extras & Services (47 items)", h2_style))
    for cat, items in CREATIVE_EXTRAS.items():
        is_roman = cat == "Roman Blinds"
        cat_label = f"{cat} ⚠ PRODUCT NOT EXTRAS" if is_roman else cat
        story.append(Paragraph(f"<b>{cat_label}</b> ({len(items)} items)", h3_style))
        if is_roman:
            story.append(Paragraph(
                "<i>These are components of Roman Blinds (a product type), not generic extras. "
                "They should move to a dedicated Creative Roman Blinds product.</i>",
                warn_style
            ))
        ext_data = [['Item', 'Price', 'Type']]
        for item in items:
            ext_data.append([item['name'], item['price'], item['type']])
        col_color = colors.HexColor('#c0392b') if not is_roman else colors.HexColor('#e67e22')
        t = Table(ext_data, colWidths=[260, 70, 110])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), col_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fdf5f0') if is_roman else colors.HexColor('#fcf0ef')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ddd')),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t)

    # ═══════════════════════════════════════════════════
    # SECTION 3: COMPARISON & RECOMMENDATIONS
    # ═══════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("3. Comparison & Recommendations", h1_style))

    story.append(Paragraph("3.1 Product Structure Comparison", h2_style))
    comp_data = [
        ['Aspect', 'NBS', 'Creative'],
        ['Product Granularity', '7 separate products\n(Roller Screen, Roller B/O,\nVenetians, Honeycomb, PVC)', '1 unified product\n(covers Roller, Roman, Panel)'],
        ['Fabric Model', 'Generic groups (Group 1–5)\nNo named fabrics for rollers', '144 named fabrics\nacross 8 price tiers'],
        ['Sub-Product Handling', 'Each is its own product row', 'Roman & Panel Glide are\nhidden inside extras'],
        ['Motorisation', '2 options (Zero Gravity)', '17 options (Somfy range)'],
        ['Installation Charges', 'Not configured', '$60 install / $70 measure'],
        ['Pelmets', '7 options\n(Linea, Sunboss, Wrapping)', '7 options\n(Pelmet 95, Cassette,\nPadded B/O surcharges)'],
    ]
    t = Table(comp_data, colWidths=[110, 160, 180])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f3460')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#e8edf5')),
        ('ROWBACKGROUNDS', (1, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fc')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ccc')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)

    story.append(Paragraph("3.2 Recommendations", h2_style))
    story.append(Paragraph(
        "<b>1. Split Creative Internal Blinds into 3 products:</b><br/>"
        "• <b>Creative Roller Blinds</b> — Fabrics Groups 1–7 + Builder Range, Roller-specific extras<br/>"
        "• <b>Creative Roman Blinds</b> — Fabrics Groups 1–2, Roman-specific components (cleats, cord locks, etc.)<br/>"
        "• <b>Creative Panel Glides</b> — Fabrics Groups 3–6, Panel Glide-specific extras",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. Add NBS Installation Charges:</b> NBS currently has no installation or measure fee configured. "
        "Consider adding these if MCB charges for NBS installations.",
        body_style
    ))
    story.append(Paragraph(
        "<b>3. Reclassify Roman Blind Extras:</b> Move the 6 items currently in the \"Roman Blinds\" extras "
        "category to become components of the new Creative Roman Blinds product.",
        body_style
    ))
    story.append(Paragraph(
        "<b>4. NBS Fabric Detail:</b> NBS uses generic group names (\"Group 1 Generic\"). Consider adding "
        "named fabric ranges if the PDF source provides them, for a better user experience in the quote builder.",
        body_style
    ))
    story.append(Paragraph(
        "<b>5. Duplicate Pelmet 95 Entry:</b> Creative has two duplicate \"Pelmet 95\" entries in the Pelmets "
        "& Valances category — one should be removed.",
        body_style
    ))

    # Build
    doc.build(story)
    print(f"✅ Report saved to: {OUTPUT_PATH}")
    print(f"   Total pages: ~12")


if __name__ == '__main__':
    create_report()
