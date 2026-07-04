import { CommonModule } from '@angular/common';
import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonUtility } from '../../../../../core/utilities/common';
import { ROUTEPATHS } from '../../../../../core/constants/routes.constants';
import { DeliveryChallanService } from '../../../../../core/service/delivery-challan.service';
import jsPDF from 'jspdf';
import { ChallanDocumentComponent } from '../../../../../layout/challan-document/challan-document.component';
import { LoggedInUserService } from '../../../../../core/service/user.service';
import { AuditLogsComponent } from '../audit-logs/audit-logs.component';
import { FileDownloaderService } from '../../../../../core/service/file-downloader.service';
import { AuthGuard } from '../../../../../core/guards/auth.guard';

@Component({
  selector: 'app-delivery-challan-view-grid-table',
  templateUrl: './delivery-challan-view-grid-table.component.html',
  styleUrl: './delivery-challan-view-grid-table.component.scss',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
})
export class ChallanGridTableComponent implements OnInit, OnChanges {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Output() printEvent = new EventEmitter<any>();
  @Input() filterKeyword!: string;
  @Input() challanListOrg: any;
  @Input() challansList: any;
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  ROUTES = ROUTEPATHS;
  router = inject(Router);
  challanService = inject(DeliveryChallanService);
  toastr = inject(ToastrService);
  userService = inject(LoggedInUserService);
  ACTION_BY_VALUE = this.userService.getUserId();
  isApprover = this.userService.isApprover();
  @ViewChild('printChallan', { read: ViewContainerRef })
  container!: ViewContainerRef;
  private childRef!: ComponentRef<ChallanDocumentComponent>;
  modalService = inject(NgbModal);
  attachmentList: any[] = [];
  fileDownloaderService = inject(FileDownloaderService);
  authGuard = inject(AuthGuard);
  loading = signal(false);

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
      this.ROUTES.TRANSACTIONS.EDIT_CHALLAN + '/' + challanNumber,
    ]);
  }
  openViewScreen(challanNumber: string) {
    this.router.navigate([
      this.ROUTES.TRANSACTIONS.VIEW_CHALLAN,
      challanNumber
    ], {
      queryParams: { returnRoute: this.ROUTES.TRANSACTIONS.CHALLAN_VIEW }
    });
  }

  downloadAttachments(challanId: number) {
    this.challanService.getAttachments(challanId).subscribe(
      (res: any) => {
        this.downloadAllSelectedBase64Files(res?.documents);
      },
      (err: any) => {
        if (err.status === 404) {
          this.toastr.error('No Attachments to download');
        }
      }
    );
  }

  isPermitted(permission: string): boolean {
    return this.authGuard.securityGroups(permission);
  }

  printDeliveryChallan(
    challanNumber: string,
    challanStatus: string,
    transporterType: string,
    totalItemSum: number
  ) {
    this.loading.set(true);
    if (
      ['OPEN', 'Approved', 'Rejected', 'CONTROL_OUTGOING'].includes(challanStatus) &&
      totalItemSum >= 50000
    ) {
      this.toastr.error(
        'Not Allowed to Print Challan before Eway Bill Generation'
      );
      this.loading.set(false);
      return;
    }

    if (challanStatus === 'OPEN' || challanStatus === 'REJECTED') {
      this.toastr.error('Not Allowed to Print Challan before Challan Approval');
      this.loading.set(false);
      return;
    }

    this.toastr.info('Generating Challan document. Kindly wait…');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
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
      });
    });
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

  openPopup(content: any, challanId: number) {
    this.challanService.getAttachments(challanId).subscribe(
      (res: any) => {
        this.modalService.open(content, { size: 'md', centered: true });
        this.attachmentList = res?.documents;
      },
      (err: any) => {
        if (err.status === 404) {
          this.toastr.error('No Attachments to download');
        }
      }
    );
  }

  viewAttachment(file: any) {
    this.fileDownloaderService.openFileInNewTab({
      documentName: file?.documentName,
      documentData: file?.documentData,
    });
  }
  openAuditsModal(challanNumber: string) {
    const documentModal = this.modalService.open(AuditLogsComponent, {
      backdrop: 'static',
      windowClass: 'modal-width',
      size: 'lg',
      scrollable: true,
      centered: true,
      animation: true,
    });

    documentModal.componentInstance.challanNumber = challanNumber;
  }
}
