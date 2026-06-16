import { Component, inject, signal } from '@angular/core';
import { AgeingFiltersComponent } from './components/filters/ageing-filters.component';
import { AgeingGridTableComponent } from './components/grid-table/ageing-grid-table.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ReportsServiceService } from '../../../core/service/reports-service.service';
import { LoggedInUserService } from '../../../core/service/user.service';
import { Router } from '@angular/router';
import { XlsxService } from '../../../core/service/xlsx.service';
import {
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ageing',
  standalone: true,
  imports: [
    AgeingFiltersComponent,
    AgeingGridTableComponent,
    NgbPaginationModule,
    NgbTooltipModule,
    CommonModule,
    FormsModule,
    ToastrModule,
  ],
  templateUrl: './ageing.component.html',
  styleUrl: './ageing.component.scss',
})
export class AgeingComponent {
  isFilters = signal(false);
  ageingReportsList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalAgeinglist = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');

  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  today = new Date().toISOString().split('T')[0];

  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  toastr = inject(ToastrService);
  reportService = inject(ReportsServiceService);
  router = inject(Router);
  xlsxService = inject(XlsxService);
  datePipe = inject(DatePipe);

  ngOnInit(): void {
    this.getAgeingData();
  }

  getAgeingData(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters()
  ) {
    const payload = {
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.today,
      challanType: filters?.challanType || '',
      plantCodes: filters?.plantCode || this.plantCodesFromUMS,
      challanStatus: filters?.ChallanStatus || [
        'GATE_IN',
        'PARTIAL_GATE_IN',
        'GATE_OUT',
      ],
      branch: filters?.BranchName || '',
      vendorName: filters?.DestinationName || '',
      itemCategory: filters?.ItemCategories || '',
      department: filters?.Departments || '',
    };

    this.loading.set(true);
    this.reportService.getAgeingReports(payload, offset, count).subscribe(
      (response: any) => {
        const ageingReports = response?.ageingReports?.flatMap((challan: any) =>
          challan?.itemDetails.map((item: any) => ({
            challanType: challan?.challanType,
            challanNumber: challan?.challanNumber,
            challanDate: challan?.challanDate,
            expectedDate: challan?.expectedDate,
            destinationName: challan?.destinationName,
            destinationCity: challan?.destinationCity,
            destinationState: challan?.destinationState,
            destinationAddress:
              (challan?.destinationAddress1 || '') +
              (challan?.destinationAddress2 || ''),
            plantCode: challan?.plantCode,
            branchName: challan?.branchName,
            status: challan?.status,
            department: challan?.department,
            itemCategory: challan?.itemCategory,
            username: challan?.createdByDetails?.empCode,
            userDesc: challan?.createdByDetails?.name,
            approvername: challan?.approverByDetails?.empCode,
            approverDesc: challan?.approverByDetails?.name,
            lastUpdatedBy: challan?.lastUpdatedByDetails?.name,
            description: item?.description,
            challanQty: item?.challanQty,
            amount: item?.amount,
            userRemarks: challan?.userRemarks,
            approverRemarks: challan?.approverRemarks,
            receivedQty: item?.receivedDetails?.receivedQty,
            balancedQty: item?.challanQty - item?.receivedDetails?.receivedQty,
            receivedDate: item?.receivedDetails?.lastReceivedDate,
            ageing: this.getDaysDifference(
              challan?.expectedDate,
              item?.receivedDetails?.lastReceivedDate
            ),
          }))
        );

        console.log(ageingReports);

        this.ageingReportsList.set(ageingReports);
        this.totalAgeinglist.set(response.paging.total);
        this.filters.set(response.filters);
        this.loading.set(false);
      },
      (error: any) => {
        this.loading.set(false);
        console.log(error);
      }
    );
  }

  private getDaysDifference(date1Str: string, date2Str: string) {
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);

    console.log(date1Str);
    console.log(date2Str);

    // get UTC midnight to avoid timezone issues
    const utc1 = Date.UTC(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate()
    );
    const utc2 = Date.UTC(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate()
    );

    const msInDay = 1000 * 60 * 60 * 24;
    return Math.floor((utc2 - utc1) / msInDay);
  }

  getData(e: any) {
    this.appliedFilters.set(e);
    this.currentPage.set(1);
    this.getAgeingData(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getAgeingData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getAgeingData(0, this.count(), this.appliedFilters());
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Ageing Reports') {
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
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.today,
      challanType: filters?.challanType || '',
      plantCodes: filters?.plantCode || this.plantCodesFromUMS,
      challanStatus: filters?.ChallanStatus || [
        'GATE_IN',
        'PARTIAL_GATE_IN',
        'GATE_OUT',
      ],
      branch: filters?.BranchName || '',
      vendorName: filters?.DestinationName || '',
      itemCategory: filters?.ItemCategories || '',
      department: filters?.Departments || '',
    };
    this.loading.set(true);
    const fetch$ = this.reportService.getAgeingReports(
      data,
      0,
      this.totalAgeinglist()
    );
    fetch$.subscribe(
      (response: any) => {
        const mappedAgeingList = response?.ageingReports.flatMap(
          (challan: any) =>
            challan?.itemDetails.map((item: any) => ({
              'Challan Type': challan?.challanType,
              'Challan Number': challan?.challanNumber,
              'Challan Date': challan?.challanDate,
              Branch: challan?.branchName,
              Department: challan?.department,
              'Plant Code': challan?.plantCode,
              'User EmpCode': challan?.createdByDetails?.empCode,
              'User Name': challan?.createdByDetails?.name,
              'Approver EmpCode': challan?.approverByDetails?.empCode,
              'Approver Name': challan?.approverByDetails?.name,
              'Expected Date': challan?.expectedDate,
              'Received Date': item?.receivedDetails?.lastReceivedDate,
              Ageing: this.getDaysDifference(
                challan?.expectedDate,
                item?.receivedDetails?.lastReceivedDate
              ),
              'Destination Name': challan?.destinationName,
              'Destination Address':
                (challan?.destinationAddress1 || '') +
                (challan?.destinationAddress2 || ''),
              'Destination City': challan?.destinationCity,
              'Destination State': challan?.destinationState,
              'Item Description': item?.description,
              'Total Quantity': item?.challanQty,
              Amount: item?.amount,
              'Balanced Quantity':
                item?.challanQty - item?.receivedDetails?.receivedQty,
              'Received Quantity': item?.receivedDetails?.receivedQty,
              'Challan Status': challan?.status,
              'Item Category': challan?.itemCategory,
              'User Remarks': challan?.userRemarks,
              'Approver Remarks': challan?.approverRemarks,
            }))
        );

        if (mappedAgeingList?.length !== 0) {
          this.xlsxService.xlsxExport(
            mappedAgeingList,
            this.headers(),
            fileName
          );
        } else {
          this.toastr.error('No Data to Export');
        }
        this.loading.set(false);
      },
      (err: any) => {
        this.loading.set(false);
      }
    );
  }
}
