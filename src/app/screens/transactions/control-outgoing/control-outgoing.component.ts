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
import { ControlOutgoingFilterComponent } from './components/filter/control-outgoing-filter.component';
import { ControlOutgoingGridTableComponent } from './components/grid-table/control-outgoing-grid-table.component';
import {
  NgbDateStruct,
  NgbModal,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { GateOutService } from '../../../core/service/gate-out.service';
import { LoggedInUserService } from '../../../core/service/user.service';
import { RowSelectionService } from '../../../core/service/row-selection.service';

@Component({
  selector: 'app-control-outgoing',
  standalone: true,
  imports: [
    NgbTooltipModule,
    CommonModule,
    NgbPaginationModule,
    FormsModule,
    ToastrModule,
    RouterModule,
    ControlOutgoingFilterComponent,
    ControlOutgoingGridTableComponent,
  ],
  templateUrl: './control-outgoing.component.html',
  styleUrl: './control-outgoing.component.scss',
})
export class ControlOutgoingComponent implements OnInit {
  loading = signal(false);
  fullScreen = signal(false);
  isFilters = signal(false);
  filters = signal<any[]>([]);
  appliedFilters = signal<any[]>([]);
  controlOutgoingList = signal<any[]>([]);
  gateOutService = inject(GateOutService);
  protected toastr = inject(ToastrService);
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  filterKeyword = signal('');
  currentPage = signal(1);
  count = signal(10);
  totalControlOutgoing = signal(0);
  @ViewChild('gridComponent') gridComponent!: ControlOutgoingGridTableComponent;
  activeFilters = signal<any>({});
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  today = new Date().toISOString().split('T')[0];
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  modalService = inject(NgbModal);
  protected rowSelectionService = inject(RowSelectionService);

  ngOnInit(): void {
    this.getControlOutgoingData();
  }

  // getControlOutgoingData(
  //   offset: number = 0,
  //   count: number = this.count(),
  //   filters: any = this.appliedFilters()
  // ) {
  //   const data = {
  //     fromDate: filters?.fromDate || this.today,
  //     toDate: filters?.toDate || this.getTommorrowDate(),
  //     documentType: filters?.documentType || '',
  //     documentNo: filters?.documentNo || '',
  //     transporterCode: filters?.transporterCode || '',
  //     vehicleNumber: filters?.vehicleNumber || '',
  //     status: filters?.status || ['Approved','READY_FOR_GATEOUT'],
  //     plantCodes: filters?.plantCode || this.plantCodesFromUMS,
  //   };
  //   this.loading.set(true);
  //   this.gateOutService.getControlOutgoing(data, offset, count).subscribe({
  //     next: (response: any) => {
  //       const list = response?.controlOutgoings.map((item: any) => ({
  //         ...item,
  //         frlrDate: this.convertToNgbDate(item?.frlrDate),
  //       }));
  //       this.controlOutgoingList.set(list);
  //       this.filters.set(response?.filters);
  //       this.totalControlOutgoing.set(response?.paging.total);
  //       this.loading.set(false);
  //     },
  //     error: (error: any) => {
  //       console.error('Error fetching control outgoing data:', error);
  //       this.loading.set(false);
  //     },
  //   });
  // }


  getControlOutgoingData(
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
      status: [...new Set([...(filters?.status || ['Approved']), 'READY_FOR_GATEOUT'])],
      plantCodes: filters?.plantCode || this.plantCodesFromUMS,
    };
    this.loading.set(true);
    this.gateOutService.getControlOutgoing(data, offset, count).subscribe({
      next: (response: any) => {
        const list = response?.controlOutgoings.map((item: any) => ({
          ...item,
          frlrDate: this.convertToNgbDate(item?.frlrDate),
        }));
        this.controlOutgoingList.set(list);
        this.filters.set(response?.filters);
        this.totalControlOutgoing.set(response?.paging.total);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error fetching control outgoing data:', error);
        this.loading.set(false);
      },
    });
  }

  getData(e: any) {
    this.appliedFilters.set(e);
    this.activeFilters.set(e); // Update activeFilters when filters are applied
    this.currentPage.set(1);
    this.getControlOutgoingData(0, this.count(), this.appliedFilters());
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
    this.getControlOutgoingData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getControlOutgoingData(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onPressSubmit() {
    const modalRef = this.modalService.open(this.confirmModal, {
      centered: true,
      size: 'lg',
    });
    modalRef.result.then(
      (result) => {
        if (result === 'yes') {
          this.gridComponent?.controlOutgoingAction().subscribe({
            next: () => this.toastr.success('Control Outgoing Success!'),
            error: () => this.toastr.error('Bulk update failed'),
            complete: () => this.getControlOutgoingData(),
          });
        }
      },
      () => console.log('❌ User canceled')
    );
  }
}
