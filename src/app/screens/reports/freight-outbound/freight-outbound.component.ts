import { Component, inject, signal } from '@angular/core';
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
import { FreightOutboundFiltersComponent } from './components/filters/freight-outbound-filters.component';
import { FreightOutboundGridTableComponent } from './components/grid-table/freight-outbound-grid-table.component';
import { LoggedInUserService } from '../../../core/service/user.service';
@Component({
  selector: 'app-freight-outbound',
  standalone: true,
  imports: [
    NgbPaginationModule,
    CommonModule,
    ToastrModule,
    NgbTooltipModule,
    FormsModule,
    FreightOutboundFiltersComponent,
    FreightOutboundGridTableComponent,
  ],
  templateUrl: './freight-outbound.component.html',
  styleUrl: './freight-outbound.component.scss',
})
export class FreightOutboundComponent {
  isFilters = signal(false);
  freightOutBoundReportList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalFreightOutBoundReportlist = signal(0);
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
    this.getFreightOutBoundsData();
  }

  getFreightOutBoundsData(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters()
  ) {
    const data = {
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.today,
      plantCode: filters?.plantCode || this.plantCodesFromUMS,
      transporterCode: filters?.transporterCode || '',
      vehicleNumber: filters?.vehicleNumber || '',
      vehicleSize: filters?.vehicleSize || '',
      challanNumber: filters?.challanNumber || '',

    };

    this.loading.set(true);
    this.reportService.getfreightOutBoundReports(data, offset, count).subscribe(
      (response: any) => {
        this.freightOutBoundReportList.set(response.freightReports);
        this.totalFreightOutBoundReportlist.set(response.paging.total);
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
    this.getFreightOutBoundsData(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getFreightOutBoundsData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getFreightOutBoundsData(0, this.count(), this.appliedFilters());
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Freight OutBound Reports') {
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
      plantCode: filters?.plantCode || '',
      TransporterCode: filters?.TransporterCode || '',
      VehicleNumber: filters?.VehicleNumber || '',
      VehicleSize: filters?.VehicleSize || '',
    };
    this.loading.set(true);
    const fetch$ = this.reportService.getfreightOutBoundReports(
      data,
      0,
      this.totalFreightOutBoundReportlist()
    );
    fetch$.subscribe(
      (response: any) => {
        const mappedErrorLogList = response?.freightReports.map(
          (freightReport: any) => ({
            'Challan Number': freightReport?.challanNumber,
            'Transfer Date': freightReport?.transferDate,
            'Transporter Code': freightReport?.transporterCode,
            'Transporter Name': freightReport?.transporterName,
            'Transporter Type': freightReport?.transporterType,
            'Plant Code': freightReport?.plantCode,
            'FRLR Number': freightReport?.frlrNumber,
            'FRLR Date': `'${
              this.datePipe.transform(freightReport?.frlrDate, 'yyyy-MM-dd') ||
              ''
            }'`,
            'Travelling Distance': freightReport?.travellingDistance,
            'Vehicle Number': freightReport?.vehicleNumber,
            'Vehicle Size': freightReport?.vehicleSize,
            Status: freightReport?.status?.split('_').join(' '),
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
