import { Component, inject, signal } from '@angular/core';
import { SubInventoryFiltersComponent } from './components/filters/sub-inventory-filters.component';
import { SubInventoryGridTableComponent } from './components/grid-table/sub-inventory-grid-table.component';
import { SubInventoryService } from '../../../core/service/sub-inventory.service';
import { XlsxService } from '../../../core/service/xlsx.service';
import { ROUTEPATHS } from '../../../core/constants/routes.constants';
import { CommonModule } from '@angular/common';
import {
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { LoggedInUserService } from '../../../core/service/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sub-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbTooltipModule,
    NgbPaginationModule,
    SubInventoryFiltersComponent,
    SubInventoryGridTableComponent,
  ],
  templateUrl: './sub-inventory.component.html',
  styleUrl: './sub-inventory.component.scss',
})
export class SubInventoryComponent {
  ROUTES = ROUTEPATHS;
  isFilters = signal(false);
  subInventories = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalsubInventories = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');

  private userService = inject(LoggedInUserService);
  constructor(
    private subInventoryService: SubInventoryService,
    private xlsxService: XlsxService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getSubInventories();
  }

  getSubInventories(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters
  ) {
    const plantsForLoggedInUser = this.userService.getPlantsForLoggedInUser();
    const data = {
      subInventoryCode: filters?.subInventoryCode || '',
      plantCodes: filters?.plantCodes || [...plantsForLoggedInUser],
    };
    this.loading.set(true);
    this.subInventoryService.getSubInventories(data, offset, count).subscribe(
      (response: any) => {
        this.subInventories.set(response?.subInventories);
        this.totalsubInventories.set(response?.paging?.total);
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
    this.getSubInventories(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getSubInventories(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getSubInventories(0, this.count(), this.appliedFilters());
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Sub Inventory') {
    // if (
    //   this.appliedFilters() &&
    //   Object.keys(this.appliedFilters()).length > 0
    // ) {
    this.fetchAndExportData(fileName, this.appliedFilters());
    // } else {
    //   this.fetchAndExportData(fileName);
    // }
  }

  fetchAndExportData(fileName: string, filters: any = {}) {
    const plantsForLoggedInUser = this.userService.getPlantsForLoggedInUser();
    const data = {
      subInventoryCode: filters?.subInventoryCode || '',
      plantCodes: filters?.plantCodes || [...plantsForLoggedInUser],
    };
    this.loading.set(true);
    const fetch$ = this.subInventoryService.getSubInventories(
      data,
      0,
      this.totalsubInventories()
    );

    fetch$.subscribe(
      (response: any) => {
        const mappedPlantList = response?.subInventories.map(
          (subInventory: any) => ({
            'Plant Code': subInventory?.plantCode,
            'Sub Inventory Code': subInventory?.subInventoryCode,
            'Sub Inventory Description': subInventory?.subInventoryDesc,
            Grade: subInventory?.grade,
          })
        );
        if (mappedPlantList?.length === 0) {
          this.toastr.error('No data to Export');
        } else {
          this.xlsxService.xlsxExport(
            mappedPlantList,
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
