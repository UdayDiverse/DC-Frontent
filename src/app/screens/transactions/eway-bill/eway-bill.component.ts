import { CommonModule } from '@angular/common';
import {
  Component,
  ComponentRef,
  inject,
  signal,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NgbTooltipModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { DeliveryChallanViewService } from '../../../core/service/delivery-challan-view.service';
import { XlsxService } from '../../../core/service/xlsx.service';
import { EwayBillFilterComponent } from './components/filter/eway-bill-filter.component';
import { EwayBillGridTableComponent } from './components/grid-table/eway-bill-grid-table.component';
import { ROUTEPATHS as ROUTES } from '../../../core/constants/routes.constants';
import { ChallanDocumentComponent } from '../../../layout/challan-document/challan-document.component';
import { LoggedInUserService } from '../../../core/service/user.service';

@Component({
  selector: 'app-eway-bill',
  standalone: true,
  imports: [
    NgbTooltipModule,
    CommonModule,
    NgbPaginationModule,
    FormsModule,
    ToastrModule,
    RouterModule,
    EwayBillFilterComponent,
    EwayBillGridTableComponent,
  ],
  templateUrl: './eway-bill.component.html',
  styleUrl: './eway-bill.component.scss',
})
export class EwayBillComponent {
  isFilters = signal(false);
  challansList = signal<any[]>([]);
  loading = signal(false);
  fullScreen = signal(false);
  headers = signal<string[]>([]);
  currentPage = signal(1);
  count = signal(10);
  totalChallans = signal(0);
  appliedFilters = signal<any[]>([]);
  filters = signal<any[]>([]);
  filterKeyword = signal('');
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  today = new Date().toISOString().split('T')[0];
  toastr = inject(ToastrService);
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();

  constructor(
    private xlsxService: XlsxService,
    private deliveryChallanViewService: DeliveryChallanViewService
  ) {}

  ngOnInit(): void {
    this.getDeliveryChallansData();
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

  getDeliveryChallansData(
    offset: number = 0,
    count: number = this.count(),
    filters: any = this.appliedFilters()
  ) {
    const data = {
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.getTommorrowDate(),
      plantCode: filters?.plantcode || [...this.plantCodesFromUMS],
      eWayBillType: filters?.eWayBillType || '',
      transporterType: '',
      status: filters?.challanStatus || [
        'EWAY_BILL_GENERATED',
        'EWAY_BILL_UPDATED',
        'CONTROL_OUTGOING',
        'EWAY_BILL_CANCELLED'
      ],
      challanNumber: filters?.challanNumber || '',
    };
    this.loading.set(true);
    this.deliveryChallanViewService
      .getDeliveryChallans(data, offset, count)
      .subscribe(
        (response: any) => {
          this.challansList.set(response.deliveryChallans);
          this.totalChallans.set(response.paging.total);
          this.filters.set(response.filters);
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
    this.getDeliveryChallansData(0, this.count(), this.appliedFilters());
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }

  onSearch(e: any) {
    this.filterKeyword.set(e.target.value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    const offset = (this.currentPage() - 1) * this.count();
    this.getDeliveryChallansData(offset, this.count(), this.appliedFilters());
  }

  onPageSizeChange(data: any) {
    this.count = data;
    this.currentPage.set(1);
    this.getDeliveryChallansData(0, this.count(), this.appliedFilters());
  }

  onExportHeader(headers: string[]) {
    this.headers.set(headers);
  }

  exportData(fileName: string = 'Delivery Challans') {
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
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.today,
      plantCode: filters?.plantcode || [...this.plantCodesFromUMS],
      eWayBillType: filters?.eWayBillType || '',
      transporterType: 'Registered',
      status: filters?.challanStatus || [
        'EWAY_BILL_GENERATED',
        'EWAY_BILL_UPDATED',
        'CONTROL_OUTGOING',
      ],
      challanNumber: filters?.challanNumber || '',
    };
    this.loading.set(true);
    const fetch$ = this.deliveryChallanViewService.getDeliveryChallans(
      data,
      0,
      this.totalChallans()
    );

    fetch$.subscribe(
      (response: any) => {
        const mappedCustomersList = response?.deliveryChallans.map(
          (challan: any) => ({
            'Plant Name': challan?.plantName,
            'Plant Code': challan?.plantCode,
            'Branch Name': challan?.branchName,
            'Sub Inventory Code': challan?.subinventoryCode,
            'Sub Inventory Name': challan?.subinventoryName,
            'Challan Type': challan?.challanType,
            'item Category': challan?.itemCategory,
            Department: challan?.department,
            'Destination Type': challan?.destinationType,
            'Destination Code': challan?.destinationCode,
            'Destination Name': challan?.destinationName,
            DestinationAddress1: challan?.destinationAddress1,
            'Destination City': challan?.destinationCity,
            'Destination State': challan?.destinationState,
            'DestinationPostal Code': challan?.destinationPostalCode,
            'Destination GSTIN': challan?.destinationGstin,
            'Transporter Type': challan?.transporterType,
            'Transporter Name': challan?.transporterName,
            'Vehicle Number': challan?.vehicleNumber,
            'FRLR Number': challan?.frlrNumber,
            'FRLR Date': challan?.frlrDate,
            'User Remarks': challan?.userRemarks,
            Status: challan?.status,
          })
        );

        if (mappedCustomersList?.length !== 0) {
          this.xlsxService.xlsxExport(
            mappedCustomersList,
            this.headers(),
            fileName
          );
        } else {
          this.toastr.error('No Data to Export');
        }
        this.loading.set(false);
      },
      (err: any) => {
        this.loading.set(false);
      }
    );
  }
}
