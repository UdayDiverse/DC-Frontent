import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { XlsxService } from '../../../core/service/xlsx.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgbTooltipModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ChallanFiltersComponent } from './components/filter/delivery-challan-view-filter.component';
import { ChallanGridTableComponent } from './components/grid-table/delivery-challan-view-grid-table.component';
import { ROUTEPATHS as ROUTES } from '../../../core/constants/routes.constants';
import { DeliveryChallanViewService } from '../../../core/service/delivery-challan-view.service';
import { LoggedInUserService } from '../../../core/service/user.service';
import { AuthGuard } from '../../../core/guards/auth.guard';

@Component({
  selector: 'app-delivery-challan-view',
  standalone: true,
  imports: [
    NgbTooltipModule,
    CommonModule,
    NgbPaginationModule,
    FormsModule,
    ToastrModule,
    RouterModule,
    ChallanFiltersComponent,
    ChallanGridTableComponent,
  ],
  templateUrl: './delivery-challan-view.component.html',
  styleUrl: './delivery-challan-view.component.scss',
})
export class DeliveryChallanViewComponent {
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
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  today = new Date().toISOString().split('T')[0];
  toastr = inject(ToastrService);
  authGuard = inject(AuthGuard);
  constructor(
    private router: Router,
    private xlsxService: XlsxService,
    private deliveryChallanViewService: DeliveryChallanViewService
  ) {}

  ngOnInit(): void {
    this.getDeliveryChallansData();
  }

  isPermitted(permission: string): boolean {
    return this.authGuard.securityGroups(permission);
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
    const payload = {
      fromDate: filters?.fromDate || this.firstOfMonth,
      toDate: filters?.toDate || this.getTommorrowDate(),
      plantCode: filters?.plantcode || [...this.plantCodesFromUMS],
      challanType: filters?.challanType || '',
      eWayBillType: filters?.eWayBillType || '',
      challanNumber: filters?.challanNumber || '',
      status: filters?.challanStatus || [''],
    };

    this.loading.set(true);
    this.deliveryChallanViewService
      .getDeliveryChallans(payload, offset, count)
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

  refreshIfPrinted(event: any) {
    if (event?.status === 'ready') {
      this.getDeliveryChallansData();
    }
  }

  toggleFullScreen() {
    this.fullScreen.set(!this.fullScreen());
  }
  onCreateChallan() {
    this.router.navigate([ROUTES.TRANSACTIONS.CREATE_CHALLAN]);
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
    this.count.set(data);
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
      challanType: filters?.challanType || '',
      eWayBillType: filters?.eWayBillType || '',
      challanNumber: filters?.challanNumber || '',
      status: filters?.challanStatus || [''],
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
            'Challan Number': challan?.challanNumber,
            'Challan Type': challan?.challanType,
            'Challan Creation Date': challan?.creationDate,
            'Challan Created By': challan?.createdByDetails?.name,
            'Plant Name': challan?.plantName,
            'Plant Code': challan?.plantCode,
            'Branch Name': challan?.branchName,
            'Sub Inventory Code': challan?.subinventoryCode,
            'Sub Inventory Name': challan?.subinventoryName,
            'Item Category': challan?.itemCategory,
            Department: challan?.department,
            'Destination Type': challan?.destinationType,
            'Destination Code': challan?.destinationCode,
            'Destination Name': challan?.destinationName,
            DestinationAddress1: challan?.destinationAddress1,
            DestinationAddress2: challan?.destinationAddress2,
            'Destination City': challan?.destinationCity,
            'Destination State': challan?.destinationState,
            'Destination Postal Code': challan?.destinationPostalCode,
            'Destination GSTIN': challan?.destinationGstin,
            'Transporter Type': challan?.transporterType,
            'Transporter Name': challan?.transporterName,
            'Vehicle Number': challan?.vehicleNumber,
            'Vehicle Size': challan?.vehicleSize,
            'FRLR Number': challan?.frlrNumber,
            'FRLR Date': challan?.frlrDate,
            'User Remarks': challan?.userRemarks,
            'Expected Return Date': challan?.expectedDate,
            Status: challan?.status,
            Approver: challan?.approverByDetails?.name,
            'Approver Remarks': challan?.approverRemarks,
            'Approver/Rejected': challan?.approverAction,
            'Approver Action Date': challan?.approvedOn,
            'Print Count': challan?.printCount,
            'Eway Creation Type': challan?.eWayBillCreationFlag,
            'Eway Bill Number': challan?.eWayBillNumber,
            'Eway Bill Type': challan?.eWayBillType,
            'Eway Bill Amount': challan?.eWayBillAmount,
            'Eway Bill Created by': challan?.ewayBillCreatedByDetails?.name,
            'Eway Bill Generation Date': challan?.ewayBillGenerationDate,
            'Eway Bill Creation Date': challan?.ewayBillCreationDate,
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
