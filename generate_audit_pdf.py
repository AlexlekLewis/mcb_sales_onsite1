#!/usr/bin/env python3
"""
Generate PDF Audit Report for Creative Internal Blinds Fabric Database Audit
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
import datetime
import os

OUTPUT_PATH = os.path.expanduser("~/Desktop/APPBUILDSANTIGRAVITY/MCB_Sales/Fabric_Database_Audit_Report.pdf")

def create_report():
    doc = SimpleDocTemplate(OUTPUT_PATH, pagesize=A4, 
                           topMargin=20*mm, bottomMargin=20*mm,
                           leftMargin=15*mm, rightMargin=15*mm)
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], 
                                fontSize=20, spaceAfter=6, textColor=colors.HexColor('#1a1a2e'))
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'],
                                   fontSize=11, textColor=colors.HexColor('#666666'), spaceAfter=12)
    h1_style = ParagraphStyle('H1', parent=styles['Heading1'], 
                              fontSize=16, textColor=colors.HexColor('#1a1a2e'), 
                              spaceBefore=16, spaceAfter=8)
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'],
                              fontSize=13, textColor=colors.HexColor('#333333'),
                              spaceBefore=12, spaceAfter=6)
    h3_style = ParagraphStyle('H3', parent=styles['Heading3'],
                              fontSize=11, textColor=colors.HexColor('#555555'),
                              spaceBefore=8, spaceAfter=4)
    body_style = ParagraphStyle('Body', parent=styles['Normal'],
                                fontSize=9, leading=12, spaceAfter=4)
    small_style = ParagraphStyle('Small', parent=styles['Normal'],
                                 fontSize=8, leading=10, textColor=colors.HexColor('#444444'))
    error_style = ParagraphStyle('Error', parent=styles['Normal'],
                                 fontSize=9, leading=12, textColor=colors.HexColor('#cc0000'))
    warning_style = ParagraphStyle('Warning', parent=styles['Normal'],
                                   fontSize=9, leading=12, textColor=colors.HexColor('#cc6600'))
    success_style = ParagraphStyle('Success', parent=styles['Normal'],
                                   fontSize=9, leading=12, textColor=colors.HexColor('#006600'))
    
    story = []
    
    # === COVER ===
    story.append(Spacer(1, 40*mm))
    story.append(Paragraph("MCB Sales — Fabric Database Audit Report", title_style))
    story.append(Paragraph("Creative Internal Blinds • Roller Blinds Fabric Grouping", subtitle_style))
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cccccc')))
    story.append(Spacer(1, 6*mm))
    
    now = datetime.datetime.now().strftime("%d %B %Y, %I:%M %p")
    story.append(Paragraph(f"<b>Date:</b> {now}", body_style))
    story.append(Paragraph("<b>Source:</b> Creative Wholesale Blinds Pricing PDF (July 2025)", body_style))
    story.append(Paragraph("<b>Database:</b> Supabase (fabrics table)", body_style))
    story.append(Paragraph("<b>Scope:</b> Creative Internal Blinds — Roller, Roman, Panel Glide fabric groupings", body_style))
    
    story.append(Spacer(1, 10*mm))
    
    # Executive Summary
    story.append(Paragraph("Executive Summary", h1_style))
    story.append(Paragraph(
        "A comprehensive audit was performed comparing the Creative Internal Blinds fabric grouping data "
        "in the Supabase database against the authoritative Creative Wholesale Blinds Pricing PDF (July 2025). "
        "The audit found <b>significant data integrity issues</b> that would result in incorrect pricing for customers.",
        body_style
    ))
    story.append(Spacer(1, 4*mm))
    
    # Summary stats table
    summary_data = [
        ['Metric', 'Count', 'Severity'],
        ['PDF Fabrics (Roller Blinds)', '133', '—'],
        ['DB Fabrics (Internal Blinds)', '78', '—'],
        ['Group Mismatches', '37', 'CRITICAL'],
        ['Missing from DB', '55', 'HIGH'],
        ['Name Mismatches', '13', 'MEDIUM'],
        ['Extra in DB (not in PDF)', '12', 'LOW'],
        ['Format Inconsistencies', '3', 'LOW'],
        ['Duplicate Entries (Curtains)', '2', 'MEDIUM'],
        ['Total Fixes Required', '111', '—'],
    ]
    
    t = Table(summary_data, colWidths=[180, 60, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    
    story.append(PageBreak())
    
    # === SECTION 1: PDF Source Data ===
    story.append(Paragraph("1. PDF Source Data Overview", h1_style))
    story.append(Paragraph(
        "The Creative Wholesale Blinds Pricing PDF (July 2025) contains three separate fabric grouping tables, "
        "one for each product sub-type. Groups are numbered sequentially and determine the pricing tier for each fabric.",
        body_style
    ))
    
    pdf_summary = [
        ['Product Type', 'Total Fabrics', 'Groups Used'],
        ['Roller Blinds', '133', 'Groups 1–7'],
        ['Roman Blinds', '33', 'Groups 1–2'],
        ['Panel Glides', '97', 'Groups 3–6'],
    ]
    t = Table(pdf_summary, colWidths=[140, 100, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d2d5e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 4*mm))
    
    roller_groups = [
        ['Group', 'Fabrics', 'Example Fabrics'],
        ['1', '5', 'Kleenscreen, Sanctuary LF, Bancoora B/O, Focus B/O, Vibe B/O'],
        ['2', '28', 'Aventus 5%, Balmoral LF, Cascata B/O, Duo B/O, Sanctuary B/O, ...'],
        ['3', '33', 'Bella, Aventus 3%, Balmoral B/O, Dakota, Jersey B/O, Le Reve B/O, ...'],
        ['4', '46', 'Husk II Sheer, Chatsworth B/O, Daintree B/O, Evolution, Gala B/O, ...'],
        ['5', '11', 'Civic B/O Non-FR, E-Screen, Longreach B/O, Scarborough B/O, ...'],
        ['6', '7', 'Baltic Plus B/O, Civic B/O FR, Kenross B/O, Seychelles Plus B/O, ...'],
        ['7', '3', 'EnviroTech, M-Screen Deco, Willandra B/O'],
    ]
    story.append(Paragraph("Roller Blinds — Group Breakdown:", h3_style))
    t = Table(roller_groups, colWidths=[40, 50, 360])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#444477')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)
    
    story.append(PageBreak())
    
    # === SECTION 2: Group Mismatches ===
    story.append(Paragraph("2. Group Mismatches — Wrong Pricing Tier", h1_style))
    story.append(Paragraph(
        "The following 37 fabrics exist in the database but are assigned to the <b>wrong price group</b> "
        "compared to the PDF. This means customers are being quoted <b>incorrect prices</b> for these fabrics.",
        error_style
    ))
    story.append(Spacer(1, 3*mm))
    
    mismatches = [
        ['Fabric Name', 'DB Group', 'PDF Group', 'Shift'],
        ['Balmoral B/O (Roller)', '2', '3', '+1'],
        ['Baltic Plus LF', '4', '5', '+1'],
        ['Barbados B/O', '2', '3', '+1'],
        ['Barrier Reef B/O', '3', '4', '+1'],
        ['Belice B/O', '3', '4', '+1'],
        ['Boston B/O', '3', '4', '+1'],
        ['Broome Blind B/O', '3', '4', '+1'],
        ['Buxton B/O', '3', '4', '+1'],
        ['Chatsworth B/O', '3', '4', '+1'],
        ['Chester B/O', '3', '4', '+1'],
        ['Concord B/O', '3', '4', '+1'],
        ['Daintree B/O', '3', '4', '+1'],
        ['Dakota', '2', '3', '+1'],
        ['Evolution', '2', '4', '+2'],
        ['Gala B/O', '3', '4', '+1'],
        ['Husk II Sheer', '3', '4', '+1'],
        ['Icon FR B/O', '3', '4', '+1'],
        ['Jersey B/O', '2', '3', '+1'],
        ['Kleenscreen B/O', '1', '4', '+3'],
        ['Le Reve B/O', '2', '3', '+1'],
        ['Le Reve LF', '2', '3', '+1'],
        ['Linesque B/O', '3', '4', '+1'],
        ['Mandalay B/O', '2', '4', '+2'],
        ['Mantra B/O', '2', '3', '+1'],
        ['Mantra LF', '2', '3', '+1'],
        ['Mercury II B/O', '3', '4', '+1'],
        ['Metro Shade B/O', '2', '3', '+1'],
        ['New Palm Beach LF', '2', '3', '+1'],
        ['Palm Beach B/O', '2', '3', '+1'],
        ['Petra B/O', '3', '4', '+1'],
        ['Sensory Sheer', '3', '4', '+1'],
        ['Sierra B/O', '2', '3', '+1'],
        ['Skye B/O', '2', '3', '+1'],
        ['Skye LF', '2', '3', '+1'],
        ['Sydney B/O', '3', '4', '+1'],
        ['Tapestry B/O', '2', '4', '+2'],
        ['Thredbo B/O', '3', '4', '+1'],
        ['Thredbo LF', '3', '4', '+1'],
        ['Tuscany Blind B/O', '3', '4', '+1'],
        ['Tuscany Blind LF', '3', '4', '+1'],
        ['Uluru LF', '3', '4', '+1'],
        ['Vibe B/O Metallic', '1', '2', '+1'],
        ['Vivid Block', '2', '3', '+1'],
    ]
    
    t = Table(mismatches, colWidths=[170, 60, 60, 40])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cc0000')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fff0f0')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)
    
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        "<b>Root Cause:</b> The original data import appears to have systematically shifted fabric groups. "
        "Most fabrics are off by +1 group (i.e., a Group 3 fabric was stored as Group 2). "
        "A few fabrics (Evolution, Mandalay B/O, Tapestry B/O) are off by +2, and Kleenscreen B/O is off by +3. "
        "This strongly suggests the initial PDF extraction or import script had a systematic error.",
        body_style
    ))
    
    story.append(PageBreak())
    
    # === SECTION 3: Missing Fabrics ===
    story.append(Paragraph("3. Fabrics Missing from Database", h1_style))
    story.append(Paragraph(
        "The following 55 fabrics exist in the PDF Roller Blinds grouping but have <b>no corresponding entry</b> "
        "in the database. Users cannot select these fabrics when building quotes.",
        error_style
    ))
    story.append(Spacer(1, 3*mm))
    
    missing = [
        ['Fabric Name', 'PDF Group', 'Supplier'],
        ['Antigua B/O', '3', '4-Families'],
        ['Aventus 3%', '3', 'Shaw'],
        ['Baltic Plus B/O', '6', 'H.Douglas'],
        ['Barrier Reef LF', '4', 'Wilsons'],
        ['Belice LF', '3', 'Uniline'],
        ['Bella', '3', 'CWSB'],
        ['Bond B/O', '3', '4-Families'],
        ['Boston LF', '4', 'Wilsons'],
        ['Broome Blind LF', '4', 'Wilsons'],
        ['Civic B/O FR', '6', 'H.Douglas'],
        ['Civic B/O Non-FR', '5', 'H.Douglas'],
        ['Concord LF', '4', 'Wilsons'],
        ['Daintree LF', '4', 'Wilsons'],
        ['Divine', '3', 'CWSB'],
        ['Duo LF', '4', 'Shaw'],
        ['E-Screen 6% 2x2', '5', 'H.Douglas'],
        ['E-Screen 10%', '5', 'H.Douglas'],
        ['Edge B/O (new)', '2', 'Shaw'],
        ['Elegance', '3', 'CWSB'],
        ['EnviroTech', '7', 'H.Douglas'],
        ['Envirovision', '4', 'Shaw'],
        ['Finesse', '3', 'CWSB'],
        ['GreenAir P05 5%', '2', 'CWSB'],
        ['GreenAir P10 10%', '2', 'CWSB'],
        ['Hampton B/O', '4', 'Uniline'],
        ['Hampton LF', '3', 'Uniline'],
        ['Jersey LF', '3', 'Texstyle'],
        ['Karma B/O', '3', 'Shaw'],
        ['Kenross B/O', '6', 'H.Douglas'],
        ['Kenross LF', '6', 'H.Douglas'],
        ['Linesque LF', '4', 'Shaw'],
        ['Longreach B/O', '5', 'Wilsons'],
        ['Longreach LF', '4', 'Wilsons'],
        ['M-Screen 1x2', '5', 'H.Douglas'],
        ['M-Screen Deco', '7', 'H.Douglas'],
        ['Marley B/O', '4', 'Wilsons'],
        ['Mercury II LF', '4', 'Wilsons'],
        ['Nishi B/O', '3', '4-Families'],
        ['Noosa B/O', '5', 'Wilsons'],
        ['Noosa LF', '4', 'Wilsons'],
        ['One Screen', '2', 'Texstyle'],
        ['Optima Screen Plus', '4', 'H.Douglas'],
        ['Palermo Sheer', '3', 'Uniline'],
        ['Plaza Plus B/O', '4', 'H.Douglas'],
        ['Resene B/O', '2', '4-Families'],
        ['Scarborough B/O', '5', 'H.Douglas'],
        ['Scarborough LF', '5', 'H.Douglas'],
        ['Serengetti B/O', '5', 'Texstyle'],
        ['Serengetti LF', '4', 'Texstyle'],
        ['Seychelles Plus B/O', '6', 'H.Douglas'],
        ['Sirocco B/O', '3', 'Uniline'],
        ['Solar View', '3', 'Texstyle'],
        ['Spectrum 3% Alu', '6', 'Uniline'],
        ['St Lucia Sheer', '4', 'Wilsons'],
        ['Sydney LF', '4', 'Wilsons'],
        ['Tasman B/O', '3', '4-Families'],
        ['Uluru B/O', '5', 'Wilsons'],
        ['Uniview Screen 10%', '2', 'Uniline'],
        ['Uniview Screen 2%', '4', 'Uniline'],
        ['Uniview Screen 5%', '2', 'Uniline'],
        ['Vivid Shade', '3', 'Texstyle'],
        ['Whitsundays Sheer', '4', 'Wilsons'],
        ['Willandra B/O', '7', 'H.Douglas'],
        ['Willandra LF', '6', 'H.Douglas'],
        ['Zen B/O', '2', 'H.Douglas'],
    ]
    
    t = Table(missing, colWidths=[170, 60, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cc6600')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fff8f0')]),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t)
    
    story.append(PageBreak())
    
    # === SECTION 4: Name Mismatches ===
    story.append(Paragraph("4. Name Mismatches Between PDF and Database", h1_style))
    story.append(Paragraph(
        "The following fabrics have slightly different names in the PDF vs the database. "
        "These may be intentional variations or could indicate data entry errors.",
        warning_style
    ))
    story.append(Spacer(1, 3*mm))
    
    name_mismatches = [
        ['PDF Name', 'DB Name', 'Group Match?'],
        ['Balmoral B/O', 'Balmoral B/O Roller', 'No (PDF:3, DB:2)'],
        ['Dawn B/O', 'Dawn', 'Yes (2)'],
        ['Husk II Sheer', 'Husk II Sheer Blind', 'No (PDF:4, DB:3)'],
        ['Icon FR B/O', 'Icon FR', 'No (PDF:4, DB:3)'],
        ['Kleenscreen B/O', 'Kleenscreen', 'No (PDF:4, DB:1)'],
        ['Mandalay B/O', 'Mandalay', 'No (PDF:4, DB:2)'],
        ['Miami B/O', 'Miami B/O Foam Backed', 'Yes (2)'],
        ['One Block B/O', 'One Block', 'Yes (2)'],
        ['Palm Beach B/O', 'New Palm Beach B/O', 'No (PDF:3, DB:2)'],
        ['Sensory Sheer', 'Sensory Sheer Blind', 'No (PDF:4, DB:3)'],
        ['Solitaire B/O', 'Solitaire B/O Roller', 'Yes (2)'],
        ['Sunset B/O', 'Sunset', 'Yes (2)'],
        ['Vibe B/O Metallic', 'Vibe B/O', 'No (PDF:2, DB:1)'],
    ]
    
    t = Table(name_mismatches, colWidths=[140, 160, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#555577')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5fa')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)
    
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        "<b>Key Observation:</b> Some DB entries like 'Kleenscreen' (Group 1) appear to be the screen/LF version, "
        "while the PDF lists 'Kleenscreen B/O' as a separate blockout fabric in Group 4. These may be distinct "
        "products that should both exist in the database. Similarly, 'Vibe B/O' (DB, Group 1) vs 'Vibe B/O Metallic' "
        "(PDF, Group 2) appear to be different fabrics.",
        body_style
    ))
    
    # === SECTION 5: DB extras not in PDF ===
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph("5. Database Entries Not in PDF Roller Blinds", h2_style))
    story.append(Paragraph(
        "The following fabrics exist in the DB but were not found in the Roller Blinds fabric grouping table. "
        "Some may belong to Roman Blinds or Panel Glides only, or may be legacy entries.",
        body_style
    ))
    
    extras_in_db = [
        ['DB Fabric Name', 'DB Group', 'Brand', 'Notes'],
        ['Avilla B/O', '3', 'H.Douglas', 'Not in any PDF table — possible legacy'],
        ['Chatsworth LF', '1', 'Shaw', 'Only in Roman Blinds (Group 1)'],
        ['Focus Roller', '1', 'Texstyle', 'PDF has "Focus B/O" — may be same'],
        ['Hampton Blockout', '2', 'Uniline', 'PDF has "Hampton B/O" (Grp 4)'],
        ['Karma Roller', '2', 'Shaw', 'PDF has "Karma B/O" (Grp 3)'],
        ['Pearlised', '2', 'Uniline', 'Not in PDF tables'],
        ['Plaza Plus Roller', '3', 'H.Douglas', 'PDF has "Plaza Plus B/O" (Grp 4)'],
        ['Quest / Quest Blockout', 'builder', 'Shaw', 'Builder Range — correct'],
        ['Sirocco Blockout', '2', 'Uniline', 'PDF has "Sirocco B/O" (Grp 3)'],
        ['Vibe Roller', '1', 'Shaw', 'May be distinct from "Vibe B/O"'],
        ['Vibe Roller Metallic', '2', 'Shaw', 'PDF has "Vibe B/O Metallic" (Grp 2)'],
    ]
    
    t = Table(extras_in_db, colWidths=[120, 50, 80, 190])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#666699')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)
    
    story.append(PageBreak())
    
    # === SECTION 6: Other Issues ===
    story.append(Paragraph("6. Additional Issues", h1_style))
    
    story.append(Paragraph("6a. Format Inconsistencies", h2_style))
    story.append(Paragraph(
        "Some price_group values use 'Group X' format instead of just 'X'. This inconsistency could cause "
        "filtering and lookup failures in the application.",
        body_style
    ))
    
    format_data = [
        ['Product', 'Fabric', 'Current Value', 'Should Be'],
        ['Internal Blinds', 'Quest', 'Builder Range', 'builder'],
        ['Curtains', 'Horizon (Nettex)', 'Group 1', '1'],
        ['Curtains', 'Galaxy (Hoad)', 'Group 2', '2'],
    ]
    t = Table(format_data, colWidths=[100, 120, 100, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#555555')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)
    
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("6b. Duplicate Entries (Curtains)", h2_style))
    story.append(Paragraph(
        "'Horizon' appears 3 times in Curtains fabrics (Groups 1, Group 1, 2 — brands: Nettex, Nettex, Hoad). "
        "'Galaxy' appears 3 times (Groups Group 2, 2, 2 — brands: Hoad, Nettex, Hoad). "
        "The 'Group X' format entries are duplicates of the numeric entries and should be removed.",
        body_style
    ))
    
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph("6c. Cross-Product Consistency", h2_style))
    story.append(Paragraph(
        "Good news: All fabrics that appear across multiple product types (Roller, Roman, Panel Glide) "
        "have <b>consistent group assignments</b>. The Roman Blinds and Panel Glides tables use the same group "
        "numbers as Roller Blinds for shared fabrics, so a single price_group value per fabric is sufficient.",
        success_style
    ))
    
    story.append(PageBreak())
    
    # === SECTION 7: Recommendations ===
    story.append(Paragraph("7. Recommendations", h1_style))
    
    story.append(Paragraph("Immediate Actions (Critical)", h2_style))
    story.append(Paragraph("1. <b>Fix all 37 group mismatches</b> — These are causing incorrect pricing. "
                          "Apply the UPDATE statements from the audit script.", body_style))
    story.append(Paragraph("2. <b>Add 55 missing fabrics</b> — These fabrics cannot currently be quoted. "
                          "Insert them with the correct group assignments from the PDF.", body_style))
    story.append(Paragraph("3. <b>Fix 3 format inconsistencies</b> — Normalize all price_group values to "
                          "numeric strings ('1', '2', etc.) or 'builder'.", body_style))
    story.append(Paragraph("4. <b>Remove 2 duplicate Curtains entries</b> — Delete the 'Group X' format duplicates.", body_style))
    
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("Process Improvements", h2_style))
    story.append(Paragraph("5. <b>Implement PDF-to-DB validation</b> — After any data import, run the audit script "
                          "to verify fabric groupings match the source PDF.", body_style))
    story.append(Paragraph("6. <b>Standardize naming conventions</b> — Resolve the 13 name mismatches by aligning "
                          "DB names with PDF names or documenting intentional differences.", body_style))
    story.append(Paragraph("7. <b>Review DB-only entries</b> — Investigate the 12 fabrics in the DB that aren't in "
                          "the PDF to determine if they should be kept, renamed, or removed.", body_style))
    
    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cccccc')))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        f"Report generated: {now} | Audit Script: fabric_audit.py | Data Source: creative_internal_text.txt",
        small_style
    ))
    
    doc.build(story)
    print(f"PDF report saved to: {OUTPUT_PATH}")


if __name__ == '__main__':
    create_report()
