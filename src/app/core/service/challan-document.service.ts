import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChallanDocumentService {
  documentDefinition = {
    pageSize: 'A4',
    pageMargins: [30, 30, 30, 40],
    content: [
      // Header
      {
        columns: [
          {
            image: 'data:image/png;base64,...', // Base64 LG logo (optional)
            width: 80,
          },
          {
            text: 'LG Electronics India Pvt. Ltd.',
            style: 'header',
            alignment: 'center',
            margin: [0, 15, 0, 0],
          },
        ],
      },

      {
        text: 'RETURNABLE CHALLAN (NOT FOR SALE)\nORIGINAL FOR RECIPIENT',
        style: 'subheader',
        alignment: 'center',
        margin: [0, 10, 0, 10],
      },

      // Supplier details & challan info
      {
        columns: [
          {
            width: '*',
            stack: [
              {
                text: 'Supplier Name: LG Electronics India (PVT.) Ltd.',
                style: 'smallBold',
              },
              {
                text: 'Address: Plot No-51, Udyog Vihar, Surajpur Kasna Road, Greater Noida, Uttar Pradesh (A02-CN2)',
              },
              { text: 'State Code: 09', margin: [0, 2, 0, 0] },
              { text: 'Consignee GST No: 09AAACL1745Q1ZE' },
              { text: 'PAN: AAACL1745Q' },
              { text: 'Organization: A02QL, Refrigerator Division(Noida)' },
              { text: 'CIN: U31900DL1997PTC021099' },
            ],
          },
          {
            width: '*',
            stack: [
              { text: 'Challan No: A02GR25P10000013', style: 'smallBold' },
              { text: 'Challan Date: 18-APR-2024' },
              { text: 'Expected Return Date: 15-MAY-2024' },
              { text: 'Requested Dept: REF-QA' },
              { text: 'Status: CONFIRM' },
            ],
          },
        ],
        columnGap: 20,
        margin: [0, 0, 0, 10],
      },

      // Receiver Details
      {
        columns: [
          {
            width: '*',
            stack: [
              {
                text: 'Details of Receiver: INN02417 / JLLIN Electronics India Pvt. Ltd - Noida',
                style: 'smallBold',
              },
              {
                text: 'Address: Plot No 27 & 28 Udyog Kendra Ecotech-3, Extension-2, Greater Noida',
              },
              { text: 'Tel No: 3938235' },
              { text: 'Country: IN', margin: [0, 2, 0, 0] },
              { text: 'GST No: 09AAACJ8434L1Z6' },
              { text: 'PAN: AAACJ8434L' },
            ],
          },
          {
            width: '*',
            stack: [
              { text: 'Prepared by: 1L190300' },
              { text: 'Checked by: ' },
              { text: 'Authorized: 1L200957 / DOULTANI, JITESH' },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },

      // Items Table
      {
        table: {
          headerRows: 1,
          widths: [20, '*', 60, 40, 40, 40, 40],
          body: [
            [
              { text: 'Sr.No.', bold: true },
              { text: 'Item Description', bold: true },
              { text: 'HS Code', bold: true },
              { text: 'Qty', bold: true },
              { text: 'UOM', bold: true },
              { text: 'Rate', bold: true },
              { text: 'Value', bold: true },
            ],
            ['1', 'Main PCB - PCFB: 8239', '8529', '2.00', 'EA', '250', '500'],
            [
              '2',
              'User Remote + PCB with IR, to run 1.5T Split Testing',
              '8529',
              '2.00',
              'EA',
              '250',
              '500',
            ],
            [
              {
                text: 'Authorized Remarks - Sent for Testing Purpose',
                colSpan: 7,
                alignment: 'center',
              },
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              { text: '', border: [false, true, false, false] },
              { text: '', border: [false, true, false, false] },
              { text: '', border: [false, true, false, false] },
              { text: '', border: [false, true, false, false] },
              { text: '', border: [false, true, false, false] },
              { text: '', border: [false, true, false, false] },
              {
                text: 'Total: 1000',
                border: [true, true, true, false],
                alignment: 'right',
                bold: true,
              },
            ],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 10],
      },

      // Additional Information
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Truck No:', style: 'smallBold' },
              { text: 'eWay Bill Type: By Hand' },
              { text: 'Carrier Name: ' },
              { text: 'Rupees in Words: One Thousand' },
            ],
          },
          {
            width: '*',
            stack: [
              { text: 'LR No:', style: 'smallBold' },
              { text: 'eWay Bill No:' },
              { text: 'SGST/UTGST: -', margin: [0, 5, 0, 0] },
              { text: 'CGST: -' },
              { text: 'IGST: -' },
            ],
          },
        ],
      },

      // Signature
      {
        text: '\n\nFor LG ELECTRONICS INDIA PVT. LTD.\n\nAUTHORIZED SIGNATORY',
        alignment: 'right',
        margin: [0, 20, 0, 0],
      },

      // Footer Note
      {
        text: [
          '\n\nRegd. Office Address: A-24/6, Mohan Cooperative Industrial Estate, Mathura Road, New Delhi - 110044\n',
          'Note: This is a computer-generated document and does not require any signature or stamp. ',
        ],
        style: 'footer',
        alignment: 'center',
        margin: [0, 10, 0, 0],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
      smallBold: {
        fontSize: 10,
        bold: true,
      },
      footer: {
        fontSize: 8,
        italics: true,
      },
    },
  };
}
