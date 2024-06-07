import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  companyInfo: {
    marginBottom: 20,
  },
  invoiceInfo: {
    marginBottom: 20,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  footer: {
    marginTop: 20,
  },
});

const InvoicePDF = ({ invoice }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text>NDT Global W.L.L</Text>
        <Text>BIW Business Park / PO.Box. 52009 / No.122 / Bldg. 2004 / Road. 1527 / Block. 115 / Hidd</Text>
        <Text>Kingdom of Bahrain</Text>
        <Text>Tel: +973-17006610 / Mobile: +973-33445432</Text>
        <Text>Web: www.ndtglobalwll.com | Email: admin@ndtglobalwll.com</Text>
      </View>
      
      <View style={styles.invoiceInfo}>
        <Text>Tax Invoice</Text>
        <Text>Date: {invoice.date}</Text>
        <Text>To: {invoice.customer}</Text>
        <Text>CR #: {invoice.crNo}</Text>
        <Text>P.O. Box: {invoice.pobox}</Text>
        <Text>Road: {invoice.road}, Bldg.: {invoice.building}</Text>
        <Text>{invoice.city}, {invoice.country}</Text>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Description</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Date</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Quantity</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Amount (BHD)</Text>
          </View>
        </View>
        {invoice.entries.map((entry, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{entry.description}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{entry.date}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{entry.qty}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{entry.amount}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text>Total Amount (Excluding VAT): {invoice.totalAmountExclVAT} BHD</Text>
        <Text>Value Added Tax (10%): {invoice.vatAmount} BHD</Text>
        <Text>Total Amount (Including VAT): {invoice.totalAmountInclVAT} BHD</Text>
        <Text>Banking details:</Text>
        <Text>Account Name: NDT GLOBAL W.L.L</Text>
        <Text>Account Number: 071010012931</Text>
        <Text>IBAN NUMBER: BH57KFHO00071010012931</Text>
        <Text>Swift Code: KFHOBHBM</Text>
        <Text>Bank Name: Kuwait Finance House</Text>
        <Text>Country: Kingdom of Bahrain</Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
