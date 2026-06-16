import { Component, signal } from '@angular/core';
import { CustomerFiltersComponent } from './components/filters/customer-filters.component';
import { CustomerGridTableComponent } from './components/grid-table/customer-grid-table.component';
import { ROUTEPATHS } from '../../../core/constants/routes.constants';
import { XlsxService } from '../../../core/service/xlsx.service';
import { CustomerService } from '../../../core/service/customer.service';
import {
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CustomerFiltersComponent,
    CustomerGridTableComponent,
    NgbPaginationModule,
    FormsModule,
    CommonModule,
    NgbTooltipModule,
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss',
})
export class CustomerComponent {
  ROUTES = ROUTEPATHS;
  isFilters = signal(false);
  customerList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalCustomers = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');
  constructor(
    private customerService: CustomerService,
    private xlsxService: XlsxService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getCustomers();
  }

  getCustomers(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters
  ) {
    const data = {
      customerCode: filters?.customerCode || '',
      customerName: filters?.customerName || '',
      auCode: filters?.auCode || '',
      status: filters?.status || '',
    };
    this.loading.set(true);
    this.customerService.getCustomers(data, offset, count).subscribe(
      (response: any) => {
        this.customerList.set(response?.customers);
        this.totalCustomers.set(response?.paging?.total);
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
    this.getCustomers(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getCustomers(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getCustomers(0, this.count(), this.appliedFilters());
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Customers') {
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
      customerCode: filters?.customerCode || '',
      customerName: filters?.customerName || '',
      auCode: filters?.auCode || '',
      status: filters?.status || '',
    };
    this.loading.set(true);
    const fetch$ =
      filters && Object.keys(filters).length > 0
        ? this.customerService.getCustomers(data, 0, this.totalCustomers())
        : this.customerService.getCustomers({}, 0, this.totalCustomers());
    fetch$.subscribe(
      (response: any) => {
        const mappedCustomersList = response?.customers.map((lookup: any) => ({
          'Customer Code': lookup?.customerCode,
          'Customer Name': lookup?.customerName,
          Address:
            (lookup?.customerAddress1 || '') +
            (lookup?.customerAddress2 || '') +
            (lookup?.customerAddress3 || '') +
            (lookup?.customerAddress4 || ''),
          City: lookup?.city,
          State: lookup?.state,
          Postal: lookup?.postal,
          Phone: lookup?.customerContactNo,
          Email: lookup?.emailId,
          'Business Area': lookup?.auCode,
          GSTIN: lookup?.gstnNo,
          PAN: lookup?.gstnNo ? lookup?.gstnNo?.slice(2, 12) : lookup?.gstnNo,
          Status:
            lookup?.status === 'A'
              ? 'Active'
              : lookup?.status === 'I'
              ? 'Inactive'
              : '',
        }));
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
