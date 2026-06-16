import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal,
  TemplateRef,
  ViewChild,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NgbTooltipModule,
  NgbPaginationModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { GateOutService } from '../../../core/service/gate-out.service';
import { GateOutFilterComponent } from './components/filter/gate-out-filter.component';
import { GateOutGridTableComponent } from './components/grid-table/gate-out-grid-table.component';
import { LoggedInUserService } from '../../../core/service/user.service';
import { RowSelectionService } from '../../../core/service/row-selection.service';

@Component({
  selector: 'app-gate-out',
  standalone: true,
  imports: [
    NgbTooltipModule,
    CommonModule,
    NgbPaginationModule,
    FormsModule,
    ToastrModule,
    RouterModule,
    GateOutFilterComponent,
    GateOutGridTableComponent,
  ],
  templateUrl: './gate-out.component.html',
  styleUrl: './gate-out.component.scss',
})
export class GateOutComponent {
  loading = signal(false);
  fullScreen = signal(false);
  isFilters = signal(false);
  filters = signal<any[]>([]);
  appliedFilters = signal<any[]>([]);
  gateOutList = signal<any[]>([]);
  gateOutService = inject(GateOutService);
  protected toastr = inject(ToastrService);
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  filterKeyword = signal('');
  currentPage = signal(1);
  count = signal(10);
  totalGateOut = signal(0);
  gridComponent = viewChild<GateOutGridTableComponent>('gridComponent');
  activeFilters = signal<any>({});
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  yest = new Date().setDate(new Date().getDate() - 1);
  today = new Date().toISOString().split('T')[0];
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  @ViewChild('warningModal') warningModal!: TemplateRef<any>;
  modalService = inject(NgbModal);
  protected rowSelectionService = inject(RowSelectionService);

  ngOnInit(): void {
    this.getGateOutData();
  }

  // ngAfterViewInit() {
  //   this.modalService.open(this.warningModal, {
  //     centered: true,
  //     size: 'lg',
  //   });
  // }

  getYesterDayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const formatted =
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0');

    return formatted;
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

  getGateOutData(
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
      status: filters?.status || [
        'EWAY_BILL_GENERATED',
        'READY_FOR_GATEOUT',
        'EWAY_BILL_UPDATED',
        'CONTROL_OUTGOING',
      ],
      vehicleNumber: filters?.vehicleNumber || '',
      plantCodes: filters?.plantCode || this.plantCodesFromUMS,
    };
    this.loading.set(true);
    this.gateOutService.getControlOutgoing(data, offset, count).subscribe({
      next: (response: any) => {
        // if (
        //   filters?.vehicleNumber ||
        //   filters?.transporterCode ||
        //   filters?.documentType ||
        //   filters?.documentNo
        // ) {
        this.gateOutList.set(response?.controlOutgoings);
        // } else {
        //   this.gateOutList.set([]);
        // }
        this.filters.set(response?.filters);
        this.totalGateOut.set(response?.paging.total);
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
    this.currentPage.set(1);
    this.activeFilters.set(e);
    this.getGateOutData(0, this.count(), this.appliedFilters());
  }
  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getGateOutData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count.set(data);
    this.currentPage.set(1);
    this.getGateOutData(0, this.count(), this.appliedFilters());
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
          console.log('yes');

          this.gridComponent()
            ?.gateOutAction()
            .subscribe(
              (res: any) => {
                this.toastr.success('Gate Out Successfully!');
              },
              (err: any) => {
                this.toastr.error('Gate Out Failed!');
              },
              () => {
                this.getGateOutData();
              }
            );
        }
      },
      () => console.log('❌ User canceled')
    );
  }
}
