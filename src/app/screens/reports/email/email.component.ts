import { Component, inject, signal } from '@angular/core';
import { EmailReportFiltersComponent } from './components/filters/email-filters.component';
import { EmailReportGridTableComponent } from './components/grid-table/email-grid-table.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ReportsServiceService } from '../../../core/service/reports-service.service';
import { Router } from '@angular/router';
import { XlsxService } from '../../../core/service/xlsx.service';
import { CommonModule, DatePipe } from '@angular/common';
import {
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-email',
  standalone: true,
  imports: [
    EmailReportFiltersComponent,
    EmailReportGridTableComponent,
    NgbPaginationModule,
    CommonModule,
    ToastrModule,
    NgbTooltipModule,
    FormsModule,
  ],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss',
})
export class EmailReportComponent {
  isFilters = signal(false);
  emailReports = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalEmaillist = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');

  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  today = new Date().toISOString().split('T')[0];

  // userService = inject(LoggedInUserService);
  // plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  toastr = inject(ToastrService);
  reportService = inject(ReportsServiceService);
  router = inject(Router);
  xlsxService = inject(XlsxService);
  datePipe = inject(DatePipe);

  ngOnInit(): void {
    this.getErrorLogsData();
  }

  getErrorLogsData(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters()
  ) {
    const payload = {
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.today,
      challanNumber: filters?.challanNumber || '',
      email: filters?.email || '',
      status: filters?.status || '',
    };

    this.loading.set(true);
    this.reportService.getEmailReports(payload, offset, count).subscribe(
      (response: any) => {
        this.emailReports.set(response.emailReports);
        this.totalEmaillist.set(response.paging.total);
        this.filters.set(response.filters);
        this.loading.set(false);
      },
      (error: any) => {
        this.loading.set(false);
        console.log(error);
      }
    );
  }

  getData(e: any) {
    this.appliedFilters.set(e);
    this.currentPage.set(1);
    this.getErrorLogsData(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getErrorLogsData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getErrorLogsData(0, this.count(), this.appliedFilters());
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Email Report') {
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
      challanNumber: filters?.challanNumber || '',
      email: filters?.email || '',
      status: filters?.status || '',
    };
    this.loading.set(true);
    const fetch$ = this.reportService.getEmailReports(
      data,
      0,
      this.totalEmaillist()
    );
    fetch$.subscribe(
      (response: any) => {
        const mappedErrorLogList = response?.emailReports.map(
          (errorLog: any) => ({
            'Challan Number': errorLog?.challanNumber,
            Receiver: errorLog?.receiverByDetails?.name,
            'Receiver EmpCode': errorLog?.receiverByDetails?.empCode,
            'Receiver Email Id': errorLog?.receiverByDetails?.emailId,
            'Email Date': errorLog?.actionOn,
            'Purpose for email': errorLog?.actionType,
            'Email Status': errorLog?.status,
            'Error Message': errorLog?.error,
          })
        );

        if (mappedErrorLogList?.length !== 0) {
          this.xlsxService.xlsxExport(
            mappedErrorLogList,
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
