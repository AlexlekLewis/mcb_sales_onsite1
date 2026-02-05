import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Quote, QuoteItemFull } from '../../types';
import { formatCurrency } from '../../margin-utils';
import logo from '../../../../assets/Logo_Dark.png';

// Register a standard font if we want custom fonts later. 
// For now, Helvetica is built-in and fine.

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333',
        lineHeight: 1.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 20,
    },
    logo: {
        width: 120,
        height: 'auto',
        marginBottom: 10,
    },
    subLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
    },
    companyDetails: {
        marginTop: 8,
        fontSize: 9,
        color: '#666',
    },
    quoteInfo: {
        textAlign: 'right',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 4,
    },
    infoRow: {
        fontSize: 10,
        color: '#666',
    },
    customer: {
        marginBottom: 30,
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 9,
        textTransform: 'uppercase',
        color: '#888',
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    customerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        padding: 8,
        minHeight: 30,
    },
    colIndex: { width: '5%', textAlign: 'left' },
    colLocation: { width: '15%', textAlign: 'left' },
    colProduct: { width: '35%', textAlign: 'left' },
    colSize: { width: '20%', textAlign: 'left' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },

    cellText: { fontSize: 9, color: '#444' },
    cellSubText: { fontSize: 8, color: '#888', marginTop: 2 },

    totals: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalsBox: {
        width: 250,
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 4,
    },
    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    finalTotal: {
        borderTopWidth: 2,
        borderTopColor: '#4f46e5', // Brand Indigo
        marginTop: 6,
        paddingTop: 8,
    },
    totalLabel: { fontSize: 10, color: '#666' },
    totalValue: { fontSize: 10, color: '#333', fontWeight: 'bold' },
    finalTotalValue: { fontSize: 14, color: '#4f46e5', fontWeight: 'bold' },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    footerText: {
        fontSize: 9,
        color: '#888',
        marginBottom: 4,
    }
});

interface QuotePDFProps {
    quote: Quote;
    items: QuoteItemFull[] | any[]; // Using any[] for now to handle legacy item discrepancies
}

export const QuotePDFDocument = ({ quote, items }: QuotePDFProps) => {
    const showGst = quote.show_gst ?? true;
    const totalExGst = quote.total_amount || 0;
    const gst = totalExGst * 0.1;
    const totalIncGst = totalExGst + gst;

    const formatSize = (item: any) => {
        const width = item.width;
        const drop = item.drop;
        // Simple sizing for PDF
        if (width && drop) return `${width} x ${drop}`;
        if (width) return `${width}W`;
        if (drop) return `${drop}D`;
        return '-';
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Image style={styles.logo} src={logo} />
                        <View style={styles.companyDetails}>
                            <Text>ABN: 49 674 694 832</Text>
                            <Text>Phone: (03) xxxx xxxx</Text>
                        </View>
                    </View>
                    <View style={styles.quoteInfo}>
                        <Text style={styles.title}>QUOTE</Text>
                        <Text style={styles.infoRow}>
                            Date: {new Date(quote.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                        <Text style={styles.infoRow}>
                            Status: {quote.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Customer */}
                <View style={styles.customer}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <Text style={styles.customerName}>{quote.customer_name || 'Valued Customer'}</Text>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.colIndex, { fontWeight: 'bold' }]}>#</Text>
                    <Text style={[styles.colLocation, { fontWeight: 'bold' }]}>Location</Text>
                    <Text style={[styles.colProduct, { fontWeight: 'bold' }]}>Product / Details</Text>
                    <Text style={[styles.colSize, { fontWeight: 'bold' }]}>Size (mm)</Text>
                    <Text style={[styles.colQty, { fontWeight: 'bold' }]}>Qty</Text>
                    <Text style={[styles.colPrice, { fontWeight: 'bold' }]}>Price {showGst && '(Inc GST)'}</Text>
                </View>

                {/* Items */}
                {items.map((item, index) => {
                    const displayPrice = showGst ? item.calculated_price * 1.1 : item.calculated_price;
                    const productName = item.products?.name || item.product_name || 'Product';
                    const supplier = item.products?.supplier || '';
                    const fabric = item.item_config?.fabric_name || '';

                    return (
                        <View key={index} style={styles.tableRow} wrap={false}>
                            <Text style={styles.colIndex}>{index + 1}</Text>
                            <Text style={styles.colLocation}>{item.location || '-'}</Text>
                            <View style={styles.colProduct}>
                                <Text style={styles.cellText}>{supplier} {productName}</Text>
                                {fabric ? <Text style={styles.cellSubText}>Fabric: {fabric}</Text> : null}
                                {item.notes ? <Text style={styles.cellSubText}>{item.notes}</Text> : null}
                            </View>
                            <Text style={styles.colSize}>{formatSize(item)}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>{formatCurrency(displayPrice)}</Text>
                        </View>
                    );
                })}

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalsRow}>
                            <Text style={styles.totalLabel}>Subtotal (ex GST)</Text>
                            <Text style={styles.totalValue}>{formatCurrency(totalExGst)}</Text>
                        </View>
                        <View style={styles.totalsRow}>
                            <Text style={styles.totalLabel}>GST (10%)</Text>
                            <Text style={styles.totalValue}>{formatCurrency(gst)}</Text>
                        </View>
                        <View style={[styles.totalsRow, styles.finalTotal]}>
                            <Text style={[styles.totalLabel, { color: '#4f46e5', fontWeight: 'bold' }]}>Total (inc GST)</Text>
                            <Text style={styles.finalTotalValue}>{formatCurrency(totalIncGst)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for your business!</Text>
                    <Text style={[styles.footerText, { fontSize: 8 }]}>Quote valid for 30 days. All prices are in Australian Dollars (AUD).</Text>
                </View>
            </Page>
        </Document>
    );
};
