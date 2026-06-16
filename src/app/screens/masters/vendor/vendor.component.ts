import { Component, signal } from '@angular/core';
import {
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorFiltersComponent } from './components/filters/vendor-filters.component';
import { ROUTEPATHS } from '../../../core/constants/routes.constants';
import { XlsxService } from '../../../core/service/xlsx.service';
import { VendorService } from '../../../core/service/vendor.service';
import { VendorGridTableComponent } from './components/grid-table/vendor-grid-table.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [
    VendorFiltersComponent,
    VendorGridTableComponent,
    NgbPaginationModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule,
  ],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.scss',
})
export class VendorComponent {
  ROUTES = ROUTEPATHS;
  isFilters = signal(false);
  vendorList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalVendors = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');
  constructor(
    private vendorService: VendorService,
    private xlsxService: XlsxService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getVendors();
  }

  getVendors(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters
  ) {
    const data = {
      vendorCode: filters?.vendorCode || '',
      vendorName: filters?.vendorName || '',
      bpGroup: filters?.bpGroup || '',
      status: filters?.status || '',
    };
    this.loading.set(true);
    this.vendorService.getVendors(data, offset, count).subscribe(
      (response: any) => {
        this.vendorList.set(response?.vendors);
        this.totalVendors.set(response?.paging?.total);
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
    this.getVendors(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getVendors(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getVendors(0, this.count(), this.appliedFilters());
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Vendors') {
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
      vendorCode: filters?.vendorCode || '',
      vendorName: filters?.vendorName || '',
      bpGroup: filters?.bpGroup || '',
      status: filters?.status || '',
    };
    this.loading.set(true);
    const fetch$ =
      filters && Object.keys(filters).length > 0
        ? this.vendorService.getVendors(data, 0, this.totalVendors())
        : this.vendorService.getVendors({}, 0, this.totalVendors());

    fetch$.subscribe(
      (response: any) => {
        const mappedVendorList = response?.vendors.map((lookup: any) => ({
          'Vendor Code': lookup?.code,
          'Vendor Name': lookup?.name,
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
        }));
        if (mappedVendorList?.length === 0) {
          this.toastr.error('No data to Export');
        } else {
          this.xlsxService.xlsxExport(
            mappedVendorList,
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
