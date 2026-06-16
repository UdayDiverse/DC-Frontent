import { Component, signal } from '@angular/core';
import { LookupFiltersComponent } from './components/filter/lookup-filter.component';
import { LookupGridTableComponent } from './components/grid-table/lookup-grid-table.component';
import { Router, RouterModule } from '@angular/router';
import {
  NgbTooltipModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { XlsxService } from '../../../core/service/xlsx.service';
import { ROUTEPATHS as ROUTES } from '../../../core/constants/routes.constants';
import { LookupService } from '../../../core/service/lookup.service';
import { ROUTEPATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-lookup',
  imports: [
    LookupFiltersComponent,
    LookupGridTableComponent,
    NgbTooltipModule,
    CommonModule,
    NgbPaginationModule,
    FormsModule,
    ToastrModule,
    RouterModule,
  ],
  templateUrl: './lookup.html',
  styleUrl: './lookup.scss',
  standalone: true,
})
export class Lookup {
  ROUTES = ROUTEPATHS;
  isFilters = signal(false);
  lookupList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalLookups = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');
  constructor(
    private router: Router,
    private lookupService: LookupService,
    private xlsxService: XlsxService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getLookupData();
  }

  getLookupData(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters
  ) {
    const data = {
      code: filters?.code || '',
      lookupType: filters?.lookupType || '',
      status: filters?.status || '',
    };
    this.loading.set(true);
    this.lookupService.getLookups(data, offset, count).subscribe(
      (response: any) => {
        this.lookupList.set(response?.lookUps);
        this.totalLookups.set(response?.paging?.total);
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
    this.getLookupData(0, this.count(), this.appliedFilters());
  }

  onCreateLookup() {
    this.router.navigate([ROUTES.MASTERS.LOOKUP.CREATE]);
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getLookupData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getLookupData(0, this.count(), this.appliedFilters());
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Lookup') {
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
      code: filters?.code || '',
      lookupType: filters?.lookupType || '',
      status: filters?.status || '',
    };
    this.loading.set(true);
    const fetch$ =
      filters && Object.keys(filters).length > 0
        ? this.lookupService.getLookups(data, 0, this.totalLookups())
        : this.lookupService.getLookups({}, 0, this.totalLookups());

    fetch$.subscribe(
      (response: any) => {
        const mappedLookupsList = response.lookUps.map((lookup: any) => ({
          Type: lookup.lookUpType?.code,
          Code: lookup.code,
          Value: lookup.value,
          Description: lookup.description,
          'Notification Window (Only for Item Category)': lookup?.attribute13
            ? lookup?.attribute13
            : 'N/A',
          // 'Attribute 2': lookup.attribute2,
          // 'Attribute 3': lookup.attribute3,
          // 'Attribute 4': lookup.attribute4,
          Status: lookup.status,
        }));
        if (mappedLookupsList?.length === 0) {
          this.toastr.error('No Data to Export');
        } else {
          this.xlsxService.xlsxExport(
            mappedLookupsList,
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
