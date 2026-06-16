import { Component, inject, signal } from '@angular/core';
import { ErrorLoggingFiltersComponent } from './components/filters/error-logging-filters.component';
import { ErrorLoggingGridTableComponent } from './components/grid-table/error-logging-grid-table.component';
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
  selector: 'app-error-logging',
  standalone: true,
  imports: [
    ErrorLoggingFiltersComponent,
    ErrorLoggingGridTableComponent,
    NgbPaginationModule,
    CommonModule,
    ToastrModule,
    NgbTooltipModule,
    FormsModule,
  ],
  templateUrl: './error-logging.component.html',
  styleUrl: './error-logging.component.scss',
})
export class ErrorLoggingComponent {
  isFilters = signal(false);
  errorLoggingList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalErrorLogginglist = signal(0);
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
      responseCode: filters?.responseCode || '',
      messageSource: filters?.messageSource || '',
      methodName: filters?.methodName || '',
    };

    this.loading.set(true);
    this.reportService.getErrorLoggingReports(payload, offset, count).subscribe(
      (response: any) => {
        this.errorLoggingList.set(response.errorLoggings);
        this.totalErrorLogginglist.set(response.paging.total);
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

  exportData(fileName: string = 'Error Logging Reports') {
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
      responseCode: filters?.responseCode || '',
      messageSource: filters?.messageSource || '',
      methodName: filters?.methodName || '',
    };
    this.loading.set(true);
    const fetch$ = this.reportService.getErrorLoggingReports(
      data,
      0,
      this.totalErrorLogginglist()
    );
    fetch$.subscribe(
      (response: any) => {
        const mappedErrorLogList = response?.errorLoggings.map(
          (errorLog: any) => ({
            'Response Code': errorLog?.responseCode,
            Description: errorLog?.description,
            'Message Source': errorLog?.messageSource,
            'Method Name': errorLog?.methodName,
            'Detail Description': Array.isArray(errorLog?.detailDescriptions)
              ? errorLog.detailDescriptions.join('; ')
              : errorLog?.detailDescriptions || '',
            'Error Date Time': errorLog?.creationDate,
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
