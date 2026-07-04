import { CommonModule } from '@angular/common';
import {
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  NgbModal,
  NgbPopover,
  NgbPopoverModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonUtility } from '../../../../../core/utilities/common';
import { FormsModule } from '@angular/forms';
import { DeliveryChallanService } from '../../../../../core/service/delivery-challan.service';
import { ROUTEPATHS, ROUTEPATHS as ROUTES } from '../../../../../core/constants/routes.constants';
import { ChallanDocumentComponent } from '../../../../../layout/challan-document/challan-document.component';
import { LoggedInUserService } from '../../../../../core/service/user.service';
import { GateOutService } from '../../../../../core/service/gate-out.service';
import { FileDownloaderService } from '../../../../../core/service/file-downloader.service';
import { AuditLogsComponent } from '../../../delivery-challan-view/components/audit-logs/audit-logs.component';

@Component({
  selector: 'app-delivery-challan-approval-grid-table',
  templateUrl: './delivery-challan-approval-grid-table.component.html',
  styleUrl: './delivery-challan-approval-grid-table.component.scss',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, NgbPopoverModule, FormsModule],
})
export class ChallanApprovalGridTableComponent implements OnInit, OnChanges {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Output() refreshChallanList = new EventEmitter<void>();

  @Input() filterKeyword!: string;
  @Input() forCancellation!: string;
  @Input() challansList: any[] = [];
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  username = signal<string>('Unknown');
  router = inject(Router);
  ROUTES = ROUTEPATHS;
  deliveryChallanService = inject(DeliveryChallanService);
  toastr = inject(ToastrService);
  userService = inject(LoggedInUserService);
  gateOutService = inject(GateOutService);
  ACTION_BY_VALUE = this.userService.getUserId();
  challanService = inject(DeliveryChallanService);
  @ViewChild('printChallan', { read: ViewContainerRef })
  container!: ViewContainerRef;
  private childRef!: ComponentRef<ChallanDocumentComponent>;
  modalService = inject(NgbModal);
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  attachmentList: any[] = [];
  fileDownloaderService = inject(FileDownloaderService);
  @Output() printEvent = new EventEmitter<any>();
  loading = signal(false);

  ngOnInit(): void {
    const loginData = JSON.parse(localStorage.getItem('logindata') || '{}');
    this.username.set(loginData.username || 'unknown');
    // console.log("Username: ", this.username());
  }

  //SORTING DATA FROM FILTER CHANGES
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lookupsList']) {
      this.emitHeaders();
    }
  }

  onGoToEditLookup(lookupData: any) {
    this.router.navigate(['master/lookup', lookupData.id]);
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

  openViewScreen(challanNumber: string) {
    this.router.navigate([
      this.ROUTES.TRANSACTIONS.VIEW_CHALLAN,
      challanNumber
    ], {
      queryParams: { returnRoute: this.ROUTES.TRANSACTIONS.CHALLAN_APPROVAL }
    });
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

  cancelChallan(challanId: number, challanNumber: string) {
    const modalRef = this.modalService.open(this.confirmModal, {
      centered: true,
      size: 'lg',
    });
    modalRef.result.then(
      (result) => {
        if (result === 'yes') {
          this.gateOutService
            .bulkStatusUpdate({
              actionBy: this.ACTION_BY_VALUE,
              dcIds: [challanId],
              nerpIds: [],
              status: 'CANCELLED',
            })
            .subscribe(
              (res: any) => {
                this.toastr.success(
                  `Challan with challan number: ${challanNumber} is cancelled`
                );
                this.refreshChallanList.emit();
              },
              (err: any) => {
                this.toastr.error(
                  'Something went wrong from server side while cancelling the challan'
                );
              }
            );
        }
      },
      () => console.log('❌ User canceled')
    );
  }

  printDeliveryChallan(
    challanNumber: string,
    challanStatus: string,
    transporterType: string,
    totalItemSum: number
  ) {
    this.loading.set(true);
    if (
      transporterType === 'Registered' &&
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
        this.childRef.instance.printRequestedBy = 'True';
        this.childRef.instance.userId = this.ACTION_BY_VALUE;

        this.childRef.instance.onLoaded.subscribe((result) => {
          this.printEvent.emit(result);
          this.loading.set(false);
        });
      });
    });
  }

  openPopover(popover: NgbPopover) {
    popover.open();
  }

  handleChallanAction(
    challanNumber: string,
    remarks: string,
    popover: NgbPopover,
    action: 'Approved' | 'Rejected'
  ) {
    if (!remarks.trim()) {
      this.toastr.warning(
        `${action === 'Rejected' ? 'Rejection' : 'Approval'
        } remarks are required`
      );
      return;
    }

    const payload: any = {
      actionBy: this.username(),
      approvedBy: this.username(),
      approvedAction: action,
      approedRemarks: remarks || '',
    };

    this.loadSpinner.set(true);
    this.deliveryChallanService
      .deliveryChallanApproval(payload, challanNumber)
      .subscribe(
        () => {
          this.toastr.success(`${action}`);
          popover.close();
          this.refreshChallanList.emit();
          this.loadSpinner.set(false);
        },
        (error) => {
          console.error(error);
          this.toastr.error(`Error while ${action}ing challan`);
          this.loadSpinner.set(false);
        }
      );
  }

  openEditScreen(challanNumber: string) {
    this.router.navigate([
      ROUTES.TRANSACTIONS.CHALLAN_APPROVAL + '/',
      challanNumber,
    ]);
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
