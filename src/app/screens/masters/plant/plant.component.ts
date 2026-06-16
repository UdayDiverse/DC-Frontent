import { Component, inject, Input, signal } from '@angular/core';
import {
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantFiltersComponent } from './components/filters/plant-filters.component';
import { PlantGridTableComponent } from './components/grid-table/plant-grid-table.component';
import { ROUTEPATHS } from '../../../core/constants/routes.constants';
import { XlsxService } from '../../../core/service/xlsx.service';
import { PlantService } from '../../../core/service/plant.service';
import { LoggedInUserService } from '../../../core/service/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plant',
  standalone: true,
  imports: [
    NgbTooltipModule,
    PlantFiltersComponent,
    PlantGridTableComponent,
    NgbPaginationModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './plant.component.html',
  styleUrl: './plant.component.scss',
})
export class PlantComponent {
  ROUTES = ROUTEPATHS;
  isFilters = signal(false);
  plantList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalPlants = signal(0);
  appliedFilters = signal<any>({});
  filters = signal<any[]>([]);
  filterKeyword = signal('');
  userService = inject(LoggedInUserService);
  plantFilters = signal<any[]>([]);

  constructor(
    private plantService: PlantService,
    private xlsxService: XlsxService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getPlants();
  }

  getPlants(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters
  ) {
    const plantsForLoggedInUser = this.userService.getPlantsForLoggedInUser();
    const data = {
      plantCode: filters?.plantCode || [...plantsForLoggedInUser],
      plantType: filters?.plantType || [''],
      businessArea: filters?.businessArea || '',
    };
    this.loading.set(true);
    this.plantService.getPlants(data, offset, count).subscribe(
      (response: any) => {
        this.plantList.set(response?.plants);
        this.totalPlants.set(response?.paging?.total);
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
    this.getPlants(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getPlants(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getPlants(0, this.count(), this.appliedFilters());
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Plants') {
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
    const plantsForLoggedInUser = this.userService.getPlantsForLoggedInUser();
    const data = {
      plantCode: filters?.plantCode || [...plantsForLoggedInUser],
      plantType: filters?.plantType || [''],
      businessArea: filters?.businessArea || '',
    };
    this.loading.set(true);
    const fetch$ = this.plantService.getPlants(data, 0, this.totalPlants());

    fetch$.subscribe(
      (response: any) => {
        const mappedPlantList = response?.plants.map((lookup: any) => ({
          'Plant Code': lookup?.plantCode,
          'Plant Name': lookup?.plantName,
          Address:
            (lookup?.plantAddress1 || '') +
            (lookup?.plantAddress2 || '') +
            (lookup?.plantAddress3 || ''),
          State: lookup?.state,
          Country: lookup?.country,
          Postal: lookup?.postal,
          'Plant Type': lookup?.plantType,
          'Plant Zone': lookup?.plantZone,
          'Business Area': lookup?.businessArea,
          GST: lookup?.gstNo,
          PAN: lookup?.panNo,
        }));
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
