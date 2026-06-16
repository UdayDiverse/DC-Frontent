import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPagination, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TransporterFiltersComponent } from './components/filters/transporter-filters.component';
import { TransporterGridTableComponent } from './components/grid-table/transporter-grid-table.component';
import { ROUTEPATHS } from '../../../core/constants/routes.constants';
import { XlsxService } from '../../../core/service/xlsx.service';
import { TransporterService } from '../../../core/service/transporter.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transporter',
  standalone: true,
  imports: [
    TransporterFiltersComponent,
    TransporterGridTableComponent,
    NgbTooltipModule,
    NgbPagination,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './transporter.component.html',
  styleUrl: './transporter.component.scss',
})
export class TransporterComponent {
  ROUTES = ROUTEPATHS;
  isFilters = signal(false);
  transporterList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalTransporters = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');
  constructor(
    private transporterService: TransporterService,
    private xlsxService: XlsxService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getTransporters();
  }

  getTransporters(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters
  ) {
    const data = {
      transporterCode: filters?.transporterCode || '',
      transporterName: filters?.transporterName || '',
      bpGroup: filters?.bpGroup || '',
      status: filters?.status || '',
    };
    this.loading.set(true);
    this.transporterService.getTransporters(data, offset, count).subscribe(
      (response: any) => {
        this.transporterList.set(response?.transporters);
        this.totalTransporters.set(response?.paging?.total);
        this.filters.set(response?.filters);
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
    this.getTransporters(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getTransporters(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getTransporters(0, this.count(), this.appliedFilters());
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Transporters') {
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
      transporterCode: filters?.transporterCode || '',
      transporterName: filters?.transporterName || '',
      bpGroup: filters?.bpGroup || '',
      status: filters?.status || '',
    };

    this.loading.set(true);
    const fetch$ =
      filters && Object.keys(filters).length > 0
        ? this.transporterService.getTransporters(
            data,
            0,
            this.totalTransporters()
          )
        : this.transporterService.getTransporters(
            {},
            0,
            this.totalTransporters()
          );

    fetch$.subscribe(
      (response: any) => {
        const mappedTransportersList = response?.transporters.map(
          (lookup: any) => ({
            'Transporter Code': lookup?.code,
            'Transporter Name': lookup?.name,
            Address:
              (lookup?.address1 || '') +
              (lookup?.address2 || '') +
              (lookup?.address3 || '') +
              (lookup?.address4 || ''),
            'BP Group': lookup?.bpGroup,
            State: lookup?.state,
            GSTIN: lookup?.gstInNo,
            PAN: lookup?.panNo,
            Phone: lookup?.contactNumber,
            Email: lookup?.emailId,
            'Start Date': lookup?.startDate,
            'End Date': lookup?.endDate,
            Status:
              lookup?.status === 'A'
                ? 'Active'
                : lookup?.status === 'O'
                ? 'Inactive'
                : '',
          })
        );
        if (mappedTransportersList?.length === 0) {
          this.toastr.error('No data to Export');
        } else {
          this.xlsxService.xlsxExport(
            mappedTransportersList,
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
