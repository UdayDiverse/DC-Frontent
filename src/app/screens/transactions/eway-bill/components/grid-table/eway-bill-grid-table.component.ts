import { CommonModule } from '@angular/common';
import {
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ROUTEPATHS } from '../../../../../core/constants/routes.constants';
import { DeliveryChallanService } from '../../../../../core/service/delivery-challan.service';
import { CommonUtility } from '../../../../../core/utilities/common';
import { Router } from '@angular/router';
import { ChallanDocumentComponent } from '../../../../../layout/challan-document/challan-document.component';
import { LoggedInUserService } from '../../../../../core/service/user.service';

@Component({
  selector: 'app-eway-bill-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './eway-bill-grid-table.component.html',
  styleUrl: './eway-bill-grid-table.component.scss',
})
export class EwayBillGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Output() printEvent = new EventEmitter<any>();
  @Input() filterKeyword!: string;
  @Input() challanListOrg: any;
  @Input() challansList: any;
  loading = signal(false);
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  ROUTES = ROUTEPATHS;
  router = inject(Router);
  challanService = inject(DeliveryChallanService);
  toastr = inject(ToastrService);
  userService = inject(LoggedInUserService);
  isApprover = this.userService.isApprover();
  ACTION_BY_VALUE = this.userService.getUserId();
  @ViewChild('printChallan', { read: ViewContainerRef })
  container!: ViewContainerRef;
  private childRef!: ComponentRef<ChallanDocumentComponent>;

  constructor() { }

  ngOnInit(): void { }

  //SORTING DATA FROM FILTER CHANGES
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['challansList']) {
      this.emitHeaders();
    }
  }

  emitHeaders() {
    if (!this.table) {
      return;
    }
    const headers: string[] = [];
    const headerCells = this.table.nativeElement.querySelectorAll('thead th');
    headerCells.forEach((cell: any) => {
      if (cell.innerText.trim() !== 'Action') {
        // Exclude "Actions" header
        headers.push(cell.innerText.trim());
      }
    });
    this.exportHeader.emit(headers);
  }

  sortData(field: string) {
    if (this.sortField() === field && this.sortDirection() === 'asc') {
      this.sortDirection.set('desc');
    } else {
      this.sortDirection.set('asc');
    }
    this.sortField.set(field);
    CommonUtility.sortTableData(field, this.sortDirection(), this.challansList);
  }

  openEditScreen(challanNumber: string) {
    this.router.navigate([
      this.ROUTES.TRANSACTIONS.EWAY_BILL_GENERATION + '/' + challanNumber,
    ]);
  }

  printDeliveryChallan(
    challanNumber: string,
    challanStatus: string,
    totalItemSum: number
  ) {
    this.loading.set(true);
    if (
      !['EWAY_BILL_GENERATED', 'EWAY_BILL_UPDATED'].includes(challanStatus) &&
      totalItemSum >= 50000
    ) {
      this.toastr.error(
        'Not Allowed to Print Challan before Eway Bill Generation'
      );
      this.loading.set(false);
      return;
    }
    this.toastr.info('Generating Challan document. Kindly wait…');
    this.container.clear();
    this.childRef = this.container.createComponent(ChallanDocumentComponent);

    (this.childRef.location.nativeElement as HTMLElement).style.display = 'none';

    this.childRef.instance.challanNumber = challanNumber;
    this.childRef.instance.printRequestedBy = this.isApprover;
    this.childRef.instance.userId = this.ACTION_BY_VALUE;

    this.childRef.instance.onLoaded.subscribe((result) => {
      this.printEvent.emit(result);
      this.loading.set(false);
    });
  }

  printEwayBill(challan: any) {
    console.log(challan)
    if (challan?.eWayBillCreationFlag === 'Manual') {
      this.challanService.printEwayBill(challan?.challanNumber).subscribe(
        (res: any) => {
          const doc = [
            {
              documentName: res?.eWayBillDocumentName,
              documentData: res?.eWayBillDocumentContent,
            },
          ];
          this.downloadAllSelectedBase64Files(doc);
        },
        (err: any) => {
          if (err.status === 404) {
            this.toastr.error('No Attachments to download');
          }
        }
      )
    } else {
      const url = challan.eWayBillDocumentName;
      window.open(url, '_blank');
    }

  }

  downloadAllSelectedBase64Files(
    files: { documentName: string; documentData: string }[]
  ) {
    for (const file of files) {
      const { documentName, documentData } = file;

      // Clean and pad the base64 string
      let cleanBase64 = documentData.replace(/[\r\n\s]/g, '');
      const padding = 4 - (cleanBase64.length % 4);
      if (padding < 4) {
        cleanBase64 += '='.repeat(padding);
      }

      try {
        // Decode base64 to binary
        const binaryString = atob(cleanBase64);
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i);
        }

        // Create blob and download link
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documentName;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error(`Failed to download ${documentName}:`, e);
        alert(`Failed to download ${documentName}`);
      }
    }
  }
}
