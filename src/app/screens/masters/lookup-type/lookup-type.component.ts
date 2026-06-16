import { Component, signal } from '@angular/core';
import { LookupTypeFiltersComponent } from './components/filters/lookup-type-filters.component';
import { LookupTypeGridTableComponent } from './components/grid-table/lookup-type-grid-table.component';
import { XlsxService } from '../../../core/service/xlsx.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ROUTEPATHS } from '../../../core/constants/routes.constants';
import { LookupTypeService } from '../../../core/service/lookup-type.service';
import {
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lookup-type',
  standalone: true,
  imports: [
    CommonModule,
    LookupTypeFiltersComponent,
    LookupTypeGridTableComponent,
    RouterModule,
    NgbPaginationModule,
    FormsModule,
    NgbTooltipModule,
  ],
  templateUrl: './lookup-type.component.html',
  styleUrl: './lookup-type.component.scss',
})
export class LookupTypeComponent {
  ROUTES = ROUTEPATHS;
  isFilters = signal(false);
  filterKeyword = signal('');
  lookupTypeList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalLookups = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);

  constructor(
    private router: Router,
    private lookupTypeService: LookupTypeService,
    private xlsxService: XlsxService
  ) {}

  onCreateLookpType() {
    this.router.navigate([this.ROUTES.MASTERS.LOOKUP_TYPE.CREATE]);
  }

  ngOnInit(): void {
    this.getLookupTypes();
  }

  getLookupTypes(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters
  ) {
    const data = {
      type: filters.type || '',
      status: filters.status || '',
    };
    this.loading.set(true);
    this.lookupTypeService.getLookupsTypes(data, offset, count).subscribe(
      (response: any) => {
        this.lookupTypeList.set(response.lookUpTypes);
        this.totalLookups.set(response.paging.total);
        this.filters.set(response.filters);
        this.loading.set(false);
      },
      (error: any) => {
        this.loading.set(false);
        console.log(error);
      }
    );
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  getData(e: any) {
    this.appliedFilters = e;
    this.currentPage.set(1);
    this.getLookupTypes(0, this.count(), this.appliedFilters);
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getLookupTypes(offset, this.count(), this.appliedFilters);
  }

  onPageSizeChange(data: any) {
    this.count = data;
    this.currentPage.set(1);
    this.getLookupTypes(0, this.count(), this.appliedFilters);
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Lookup Types') {
    if (this.appliedFilters && Object.keys(this.appliedFilters).length > 0) {
      this.fetchAndExportData(fileName, this.appliedFilters);
    } else {
      this.fetchAndExportData(fileName);
    }
  }

  fetchAndExportData(fileName: string, filters: any = {}) {
    const data = {
      type: filters.type || '',
      status: filters.status || '',
    };
    const fetch$ =
      filters && Object.keys(filters).length > 0
        ? this.lookupTypeService.getLookupsTypes(data, 0, this.totalLookups())
        : this.lookupTypeService.getLookupsTypes({}, 0, this.totalLookups());

    fetch$.subscribe((response: any) => {
      const mappedLookupTypeList = response.lookUpTypes.map((lookup: any) => ({
        Type: lookup?.type,
        Description: lookup.description,
      }));
      this.xlsxService.xlsxExport(
        mappedLookupTypeList,
        this.headers(),
        fileName
      );
    });
  }
}
