import { Component, signal, OnInit, inject } from '@angular/core';
import { ROUTEPATHS as ROUTES } from '../../../core/constants/routes.constants';
import { Router, RouterModule } from '@angular/router';
import { XlsxService } from '../../../core/service/xlsx.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgbTooltipModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ChallanApprovalFiltersComponent } from './components/filter/delivery-challan-approval-filter.component';
import { ChallanApprovalGridTableComponent } from './components/grid-table/delivery-challan-approval-grid-table.component';
import { DeliveryChallanService } from '../../../core/service/delivery-challan.service';
import { DeliveryChallanViewService } from '../../../core/service/delivery-challan-view.service';
import { LoggedInUserService } from '../../../core/service/user.service';

@Component({
  selector: 'app-delivery-challan-approval',
  standalone: true,
  imports: [
    NgbTooltipModule,
    CommonModule,
    NgbPaginationModule,
    FormsModule,
    ToastrModule,
    RouterModule,
    ChallanApprovalFiltersComponent,
    ChallanApprovalGridTableComponent,
  ],
  templateUrl: './delivery-challan-approval.component.html',
  styleUrl: './delivery-challan-approval.component.scss',
})
export class DeliveryChallanApprovalComponent implements OnInit {
  isFilters = signal(false);
  challansList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalChallans = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');
  router = inject(Router);
  xlsxService = inject(XlsxService);
  deliveryChallanViewService = inject(DeliveryChallanViewService);
  datePipe = inject(DatePipe);
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  today = new Date().toISOString().split('T')[0];
  toastr = inject(ToastrService);
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  forCancellation: string = 'Approval';

  ngOnInit(): void {
    this.getDeliveryChallansData();
  }

  getTommorrowDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);

    const formatted =
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0');

    return formatted;
  }

  refreshIfPrinted(event: any) {
    if (event?.status === 'ready') {
      this.getDeliveryChallansData();
    }
  }

  getDeliveryChallansData(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters()
  ) {
    let payload = {
      plantCode: filters?.plantcode || [...this.plantCodesFromUMS],
      status: filters?.challanStatus || [],
      challanNumber: filters?.challanNumber || '',
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.getTommorrowDate(),
      createdBy: filters?.createdBy || '',
    };
    this.loading.set(true);
    this.deliveryChallanViewService
      .getDeliveryChallans(payload, offset, count)
      .subscribe(
        (response: any) => {
          this.challansList.set(response.deliveryChallans);
          this.totalChallans.set(response.paging.total);
          this.filters.set(response.filters);
          this.loading.set(false);
        },
        (error: any) => {
          this.loading.set(false);
          console.error(error);
        }
      );
  }

  getData(e: any) {
    this.appliedFilters.set(e);
    this.currentPage.set(1);
    this.getDeliveryChallansData(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onCreateChallan() {
    this.router.navigate([ROUTES.TRANSACTIONS.CREATE_CHALLAN]);
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getDeliveryChallansData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count = data;
    this.currentPage.set(1);
    this.getDeliveryChallansData(0, this.count(), this.appliedFilters());
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Approved Delivery Challans') {
    if (
      this.appliedFilters() &&
      Object.keys(this.appliedFilters()).length > 0
    ) {
      this.fetchAndExportData(fileName, this.appliedFilters());
    } else {
      this.fetchAndExportData(fileName);
    }
  }

  fetchAndExportData(fileName: string, filters: any = {}) {
    const data = {
      plantCode: filters?.plantcode || [...this.plantCodesFromUMS],
      status: filters?.challanStatus || ['OPEN'],
      challanNumber: filters?.challanNumber || '',
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.today,
      createdBy: filters?.createdBy || '',
    };
    this.loading.set(true);
    const fetch$ = this.deliveryChallanViewService.getDeliveryChallans(
      data,
      0,
      this.totalChallans()
    );
    fetch$.subscribe(
      (response: any) => {
        const mappedCustomersList = response?.deliveryChallans.map(
          (challan: any) => ({
            'Challan Number': challan?.challanNumber,
            'Challan Type': challan?.challanType,
            'Challan Date': `'${
              this.datePipe.transform(challan?.creationDate, 'yyyy-MM-dd') || ''
            }'`,
            'Plant Code': challan?.plantCode,
            'Destination Type': challan?.destinationType,
            'Destination Code': challan?.destinationCode,
            'Destination Name': challan?.destinationName,
            DestinationAddress1: challan?.destinationAddress1,
            Status: challan?.status,
            'User Remarks': challan?.userRemarks,
            'Approval Remarks': challan?.approverRemarks,
          })
        );

        if (mappedCustomersList?.length === 0) {
          this.toastr.error('No data to Export');
        } else {
          this.xlsxService.xlsxExport(
            mappedCustomersList,
            this.headers(),
            fileName
          );
        }
        this.loading.set(false);
      },
      (err: any) => {
        this.loading.set(false);
      }
    );
  }
}
