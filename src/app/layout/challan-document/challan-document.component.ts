// import {
//   Component,
//   ElementRef,
//   EventEmitter,
//   inject,
//   Inject,
//   input,
//   Output,
//   PLATFORM_ID,
//   signal,
//   viewChild,
// } from '@angular/core';
// // import html2pdf from 'html2pdf.js';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { DeliveryChallanService } from '../../core/service/delivery-challan.service';
// import { NumToWordsService } from '../../core/service/num-to-words.service';
// import { ToastrService } from 'ngx-toastr';
// import { finalize, tap } from 'rxjs';

// @Component({
//   selector: 'app-challan-document',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './challan-document.component.html',
//   styleUrl: './challan-document.component.scss',
// })
// export class ChallanDocumentComponent {
//   challanDocument = viewChild<ElementRef>('challanDocument');
//   challanNumber: string = '';
//   printRequestedBy: string = '';
//   userId: string = '';
//   private isBrowser: boolean;
//   private deliveryChallanService = inject(DeliveryChallanService);
//   private numToWordsService = inject(NumToWordsService);
//   deliveryChallan: any;
//   lookupValues: any;
//   itemDetailsSummary: any;
//   fileName = '';
//   toastr = inject(ToastrService);
//   @Output() onLoaded = new EventEmitter<any>();

//   constructor(@Inject(PLATFORM_ID) platformId: object) {
//     this.isBrowser = isPlatformBrowser(platformId);
//   }

//   ngOnInit() {
//     this.getChallan();
//   }

//   getChallan() {
//     if (this.challanNumber === '') {
//       this.toastr.error('Invalid Challan Number');
//       return;
//     }
//     if (this.printRequestedBy === '') {
//       this.toastr.error('Invalid Print Request Role');
//       return;
//     }
//     if (this.userId === '') {
//       this.toastr.error('Invalid Print Request User');
//       return;
//     }

//     const payload = {
//       hasApprovelPermission: this.printRequestedBy,
//       actionBy: this.userId,
//     };
//     this.deliveryChallanService
//       .getChallanPrintDetails(this.challanNumber, payload)
//       .subscribe(
//         (res: any) => {
//           this.deliveryChallan = res;
//           this.lookupValues = this.getLookupValues(res?.lookUpResponses);
//           this.fileName = res?.challanNumber;
//           this.calculateAndSetTotalValues(res?.dcItemDetails);
//           this.generatePDF();
//           setTimeout(() => {
//             // once done, emit back to parent
//             this.onLoaded.emit({
//               challanNumber: this.challanNumber,
//               status: 'ready',
//             });
//           }, 1000);
//         },
//         (err: any) => {
//           this.toastr.error(err?.error?.details[0]?.elementValue);
//         }
//       );
//   }

//   private getLookupValues(lookups: any[]) {
//     const lookupValues = lookups.reduce((prev, item) => {
//       prev[item.code] = item.value;
//       return prev;
//     }, {});

//     return lookupValues;
//   }

//   calculateAndSetTotalValues(items: any[]) {
//     const totalQuantity = items
//       .map((item) => item?.quantity)
//       .reduce((prev, curr) => prev + curr, 0);
//     const totalTaxableValue = items
//       .map((item) => item?.unitPrice * item?.quantity)
//       .reduce((prev, curr) => prev + curr, 0);
//     const totalSGST = items
//       .map((item) => item?.sgstAmount)
//       .reduce((prev, curr) => prev + curr, 0);
//     const totalCGST = items
//       .map((item) => item?.cgstAmount)
//       .reduce((prev, curr) => prev + curr, 0);
//     const totalIGST = items
//       .map((item) => item?.igstAmount)
//       .reduce((prev, curr) => prev + curr, 0);

//     const totalValuesObject = {
//       totalQuantity: Math.round(totalQuantity * 100) / 100,
//       totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
//       totalCGST: Math.round(totalCGST * 100) / 100,
//       totalSGST: Math.round(totalSGST * 100) / 100,
//       totalIGST: Math.round(totalIGST * 100) / 100,
//       totalTax: Math.round((totalCGST + totalSGST + totalIGST) * 100) / 100,
//       totalInvoiceAmount:
//         Math.round(
//           (totalTaxableValue + totalCGST + totalSGST + totalIGST) * 100
//         ) / 100,
//       amountInWords: this.numToWordsService.convertAmountToWords(
//         totalTaxableValue + totalCGST + totalSGST + totalIGST
//       ),
//     };
//     this.itemDetailsSummary = totalValuesObject;
//   }

//   async generatePDF() {
//     if (!this.isBrowser) return;
//     const data = this.challanDocument()?.nativeElement;

//     const html2pdf = (await import('html2pdf.js')).default;

//     const options = {
//       margin: [0, 0, 0, 0],
//       filename: this.fileName || 'my-document.pdf',
//       image: { type: 'jpeg', quality: 1 },
//       html2canvas: { scale: 4, useCORS: true, letterRendering: true },
//       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
//     };

//     html2pdf()
//       .set(options)
//       .from(data)
//       .toPdf()
//       .get('pdf')
//       .then((pdf) => {
//         const totalPages = pdf.internal.getNumberOfPages();
//         if (totalPages > 1) pdf.deletePage(totalPages);
//       })
//       .save();

//     // html2pdf().set(options).from(data).save();
//   }
// }
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Inject,
  input,
  Output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeliveryChallanService } from '../../core/service/delivery-challan.service';
import { NumToWordsService } from '../../core/service/num-to-words.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, tap } from 'rxjs';

@Component({
  selector: 'app-challan-document',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challan-document.component.html',
  styleUrl: './challan-document.component.scss',
})
export class ChallanDocumentComponent {
  challanDocument = viewChild<ElementRef>('challanDocument');
  challanNumber: string = '';
  printRequestedBy: string = '';
  userId: string = '';
  private isBrowser: boolean;
  private deliveryChallanService = inject(DeliveryChallanService);
  private numToWordsService = inject(NumToWordsService);
  deliveryChallan: any;
  lookupValues: any;
  itemDetailsSummary: any;
  fileName = '';
  cinNumber = '';
  toastr = inject(ToastrService);
  @Output() onLoaded = new EventEmitter<any>();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.getChallan();
  }

  getChallan() {
    if (this.challanNumber === '') {
      this.toastr.error('Invalid Challan Number');
      return;
    }
    if (this.printRequestedBy === '') {
      this.toastr.error('Invalid Print Request Role');
      return;
    }
    if (this.userId === '') {
      this.toastr.error('Invalid Print Request User');
      return;
    }

    const payload = {
      hasApprovelPermission: this.printRequestedBy,
      actionBy: this.userId,
    };
    this.deliveryChallanService
      .getChallanPrintDetails(this.challanNumber, payload)
      .subscribe(
        (res: any) => {
          this.deliveryChallan = res;
          this.lookupValues = this.getLookupValues(res?.lookUpResponses);
          this.cinNumber =
            res?.lookUpResponses?.find(
              (x: any) => x.type === 'CIN_Number'
            )?.value ?? '';
          this.fileName = res?.challanNumber;
          this.calculateAndSetTotalValues(res?.dcItemDetails);
          this.generatePDF();
          setTimeout(() => {
            this.onLoaded.emit({
              challanNumber: this.challanNumber,
              status: 'ready',
            });
          }, 1000);
        },
        (err: any) => {
          this.toastr.error(err?.error?.details[0]?.elementValue);
        },
      );
  }

  private getLookupValues(lookups: any[]) {
    const lookupValues = lookups.reduce((prev, item) => {
      prev[item.code] = item.value;
      return prev;
    }, {});

    return lookupValues;
  }

  calculateAndSetTotalValues(items: any[]) {
    const totalQuantity = items
      .map((item) => item?.quantity)
      .reduce((prev, curr) => prev + curr, 0);
    const totalTaxableValue = items
      .map((item) => item?.unitPrice * item?.quantity)
      .reduce((prev, curr) => prev + curr, 0);
    const totalSGST = items
      .map((item) => item?.sgstAmount)
      .reduce((prev, curr) => prev + curr, 0);
    const totalCGST = items
      .map((item) => item?.cgstAmount)
      .reduce((prev, curr) => prev + curr, 0);
    const totalIGST = items
      .map((item) => item?.igstAmount)
      .reduce((prev, curr) => prev + curr, 0);

    const totalValuesObject = {
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
      totalCGST: Math.round(totalCGST * 100) / 100,
      totalSGST: Math.round(totalSGST * 100) / 100,
      totalIGST: Math.round(totalIGST * 100) / 100,
      totalTax: Math.round((totalCGST + totalSGST + totalIGST) * 100) / 100,
      totalInvoiceAmount:
        Math.round(
          (totalTaxableValue + totalCGST + totalSGST + totalIGST) * 100,
        ) / 100,
      amountInWords: this.numToWordsService.convertAmountToWords(
        totalTaxableValue + totalCGST + totalSGST + totalIGST,
      ),
    };
    this.itemDetailsSummary = totalValuesObject;
  }

  async generatePDF() {
    if (!this.isBrowser) return;
    const data = this.challanDocument()?.nativeElement;

    const html2pdf = (await import('html2pdf.js')).default;

    const options = {
      margin: [0, 0, 0, 0],
      filename: this.fileName || 'my-document.pdf',

      image: {
        type: 'jpeg',
        quality: 1,
      },

      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#fff',
      },

      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },

      pagebreak: {
        mode: ['css', 'legacy'],
        after: '.print-page',
        avoid: ['.no-break'],
      },
    };

    // Removed the manual pdf.deletePage() hack — it was masking the real bug.
    // With autoPaging via pagebreak config, pages are created correctly.
    html2pdf().set(options).from(data).save();
    // html2pdf()
    //   .set(options)
    //   .from(data)
    //   .toPdf()
    //   .get('pdf')
    //   .then((pdf: any) => {
    //     const totalPages = pdf.internal.getNumberOfPages();
    //     const pageWidth = pdf.internal.pageSize.getWidth();
    //     const pageHeight = pdf.internal.pageSize.getHeight();

    //     for (let i = 1; i <= totalPages; i++) {
    //       pdf.setPage(i);

    //       // Optional: draw a separator line above the footer
    //       pdf.setDrawColor(0, 0, 0);
    //       pdf.setLineWidth(0.3);
    //       pdf.line(10, pageHeight - 14, pageWidth - 10, pageHeight - 14);

    //       // Footer left: your custom text
    //       pdf.setFontSize(8);
    //       pdf.setTextColor(100);
    //       pdf.text(
    //         'LG Electronics India Pvt. Ltd. | Delivery Challan',
    //         10,
    //         pageHeight - 9,
    //       );

    //       // Footer right: page number
    //       pdf.text(
    //         `Page ${i} of ${totalPages}`,
    //         pageWidth - 10,
    //         pageHeight - 9,
    //         { align: 'right' },
    //       );
    //     }
    //   })
    //   .save();
  }
}
