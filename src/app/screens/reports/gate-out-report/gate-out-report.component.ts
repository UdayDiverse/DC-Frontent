import {
  Component,
  inject,
  Inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  viewChild,
} from '@angular/core';
import { GateOutReportFilterComponent } from './components/filter/gate-out-report-filter.component';
import { GateOutReportGridTableComponent } from './components/grid-table/gate-out-report-grid-table.component';
import {
  NgbDateStruct,
  NgbModal,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { ReportsServiceService } from '../../../core/service/reports-service.service';
import { RowSelectionService } from '../../../core/service/row-selection.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggedInUserService } from '../../../core/service/user.service';

@Component({
  selector: 'app-gate-out-report',
  standalone: true,
  imports: [
    NgbTooltipModule,
    CommonModule,
    NgbPaginationModule,
    FormsModule,
    ToastrModule,
    RouterModule,
    GateOutReportFilterComponent,
    GateOutReportGridTableComponent,
  ],
  templateUrl: './gate-out-report.component.html',
  styleUrl: './gate-out-report.component.scss',
})
export class GateOutReportComponent implements OnInit {
  loading = signal(false);
  fullScreen = signal(false);
  isFilters = signal(false);
  filters = signal<any[]>([]);
  appliedFilters = signal<any[]>([]);
  GateOutReportList = signal<any[]>([]);
  reportsService = inject(ReportsServiceService);
  protected toastr = inject(ToastrService);
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  filterKeyword = signal('');
  currentPage = signal(1);
  count = signal(10);
  totalGateOutReport = signal(0);
  @ViewChild('gridComponent') gridComponent!: GateOutReportGridTableComponent;
  activeFilters = signal<any>({});
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  today = new Date().toISOString().split('T')[0];
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  modalService = inject(NgbModal);
  protected rowSelectionService = inject(RowSelectionService);
  datePipe = inject(DatePipe);
  
  ngOnInit(): void {
    this.getGateOutReportData();
  }

  getGateOutReportData(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters()
  ) {
    const data = {
      fromDate: filters?.fromDate || this.today,
      toDate: filters?.toDate || this.getTommorrowDate(),
      documentType: filters?.documentType || '',
      documentNo: filters?.documentNo || '',
      transporterCode: filters?.transporterCode || '',
      vehicleNumber: filters?.vehicleNumber || '',
      status: filters?.status || ['GATE_OUT'],
      plantCodes: filters?.plantCode || this.plantCodesFromUMS,
    };
    this.loading.set(true);
    this.reportsService.getGateOutReports(data, offset, count).subscribe({
      next: (response: any) => {
        const list = response?.controlOutgoings.map((item: any) => ({
          ...item
        }));
        this.GateOutReportList.set(list);
        this.filters.set(response?.filters);
        this.totalGateOutReport.set(response?.paging.total);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error fetching gate out report data:', error);
        this.loading.set(false);
      },
    });
  }

  getData(e: any) {
    this.appliedFilters.set(e);
    this.activeFilters.set(e); // Update activeFilters when filters are applied
    this.currentPage.set(1);
    this.getGateOutReportData(0, this.count(), this.appliedFilters());
  }

  convertToNgbDate(dateString: string): any {
    if (dateString) {
      const dateParts = dateString?.split('-');

      const date: NgbDateStruct = {
        day: parseInt(dateParts[2], 10),
        month: parseInt(dateParts[1], 10),
        year: parseInt(dateParts[0], 10),
      };
      return date;
    }
  }

  getTommorrowDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);

    const formatted =
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0');

    return formatted;
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getGateOutReportData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getGateOutReportData(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }
}
