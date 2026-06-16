import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { ROUTEPATHS } from '../../../../core/constants/routes.constants';
import { DeliveryChallanService } from '../../../../core/service/delivery-challan.service';
import { LoggedInUserService } from '../../../../core/service/user.service';
import { FileDownloaderService } from '../../../../core/service/file-downloader.service';
import {
  NgbDatepickerModule,
  NgbDateStruct,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { LOOKUPS } from '../../../../core/constants/lookups.constant';
import { LookupService } from '../../../../core/service/lookup.service';

@Component({
  selector: 'app-edit-by-approver',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    RouterLink,
    NgbDatepickerModule,
    NgbModule,
  ],
  templateUrl: './edit-by-approver.component.html',
  styleUrl: './edit-by-approver.component.scss',
})
export class EditByApproverComponent {
  ROUTES = ROUTEPATHS;
  challanNumber = input<string>('');
  expectedReturnDate: Date | null = null;
  destinationType:
    | 'Plant'
    | 'Vendor'
    | 'Unregistered Vendor'
    | 'Customer'
    | 'Unregistered Customer' = 'Plant';
  transporterType: 'Registered' | 'Unregistered' = 'Registered';
  selectedFiles: any[] = [];
  selectedFilesBase64: any[] = [];
  selectedFilesnames = signal<string[]>([]);
  storedAttachments: any[] = [];
  userService = inject(LoggedInUserService);
  deliveryChallanService = inject(DeliveryChallanService);
  toastr = inject(ToastrService);
  router = inject(Router);
  fileDownloaderService = inject(FileDownloaderService);

  plants = signal<any[]>([]);
  vendors = signal<any[]>([]);
  customers = signal<any[]>([]);
  transporters = signal<any[]>([]);
  itemCategories = signal<any[]>([]);
  subInventories = signal<any[]>([]);
  challanTypes = signal<any[]>([]);
  modeOfTransports = signal<any[]>([]);
  department = this.userService.getDepartment();
  loggedInUser = this.userService.getLoggedInUser();
  ACTION_BY_VALUE = this.userService.getUserId();
  actionBy = this.userService.getUserId();
  isRegistered = true;
  isRGP = false;
  loading = signal(false);
  challanDate = '';
  lookupService = inject(LookupService);
  frlrDate = new FormControl<NgbDateStruct | null>(null);
  expectedDate = new FormControl<NgbDateStruct | null>(null);
  expandedSections = signal({
    basicInfo: true,
    addressInfo: false,
    transporterDetails: false,
    itemDetails: true,
  });

  challanFormGroup: FormGroup = new FormGroup({
    plantName: new FormControl(''),
    plantCode: new FormControl(''),
    branchName: new FormControl(''),
    subinventoryCode: new FormControl(''),
    subinventoryName: new FormControl(''),
    challanType: new FormControl(''),
    itemCategory: new FormControl(''),
    status: new FormControl('OPEN'),
    department: new FormControl(this.department),
    expectedDate: new FormControl(null),
    destinationType: new FormControl('Plant'),
    destinationCode: new FormControl(''),
    destinationName: new FormControl(''),
    destinationAddress1: new FormControl(''),
    destinationAddress2: new FormControl(''),
    destinationCity: new FormControl(''),
    destinationState: new FormControl(''),
    destinationPostalCode: new FormControl(''),
    destinationGstin: new FormControl(''),
    transporterType: new FormControl('Registered'),
    transporterCode: new FormControl(''),
    transporterName: new FormControl(''),
    transporterGstin: new FormControl(''),
    vehicleNumber: new FormControl(''),
    vehicleSize: new FormControl(''),
    frlrNumber: new FormControl(''),
    travellingDistance: new FormControl(0),
    frlrDate: new FormControl(null),
    modeOfTransport: new FormControl(''),
    userRemarks: new FormControl(''),
    approverRemarks: new FormControl('', Validators.required),
    // createdBy: new FormControl(this.loggedInUser(), Validators.required),
    dcItemDetails: new FormArray<FormGroup>([]),
  });

  constructor(private fb: FormBuilder) {
    this.addRowToItemlist();
  }

  ngOnInit() {
    this.getModeOfTransports();
    if (this.challanNumber() != null) {
      this.getChallanAndBindToForms(this.challanNumber());
    }
  }

  public get itemList() {
    return this.challanFormGroup.get('dcItemDetails') as FormArray;
  }

  protected addRowToItemlist() {
    const fb = this.fb.group({
      id: [0],
      hsnCode: ['', Validators.required],
      descriptionModelNumber: ['', Validators.required],
      uom: ['', Validators.required],
      quantity: [''],
      unitPrice: [''],
      sgstPercentage: [''],
      sgstAmount: [''],
      cgstPercentage: [''],
      cgstAmount: [''],
      igstPercentage: [''],
      igstAmount: [''],
      totalAmount: [''],
      // gateInItemsDetails: [[]],
      status: ['Active'],
      actionBy: this.ACTION_BY_VALUE,
    });
    this.itemList.push(fb);
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

  toggleSection(
    section: 'basicInfo' | 'addressInfo' | 'transporterDetails' | 'itemDetails',
  ) {
    this.expandedSections.update((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  private getModeOfTransports() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.modeOfTransport)
      .subscribe((res: any) => {
        this.modeOfTransports.set(res?.lookUps);
      });
  }

  getChallanAndBindToForms(challanNumber: string) {
    this.loading.set(true);

    this.deliveryChallanService
      .getChallanByChallanNumber(challanNumber)
      .subscribe((res: any) => {
        this.destinationType = res?.destinationType;
        this.challanFormGroup.get('destinationType')?.enable();
        this.challanFormGroup.patchValue({
          plantName: res?.plantName,
          plantCode: res?.plantCode,
          branchName: res?.branchName,
          subinventoryCode: res?.subinventoryCode,
          subinventoryName: res?.subinventoryName,
          challanType: res?.challanType,
          itemCategory: res?.itemCategory,
          status: res?.status,
          department: res?.department,
          expectedDate: res?.expectedDate?.split('T')[0],
          destinationType: res?.destinationType,
          destinationCode: res?.destinationCode,
          destinationName: res?.destinationName,
          destinationAddress1: res?.destinationAddress1,
          destinationAddress2: res?.destinationAddress2,
          destinationCity: res?.destinationCity,
          destinationState: res?.destinationState,
          destinationPostalCode: res?.destinationPostalCode,
          destinationGstin: res?.destinationGstin,
          transporterType: res?.transporterType,
          transporterCode: res?.transporterCode,
          transporterGstin: res?.transporterGstin,
          transporterName: res?.transporterName,
          vehicleNumber: res?.vehicleNumber,
          vehicleSize: res?.vehicleSize,
          frlrNumber: res?.frlrNumber,
          travellingDistance: res?.travellingDistance,
          frlrDate: res?.frlrDate?.split('T')[0],
          modeOfTransport: res?.modeOfTransport,
          userRemarks: res?.userRemarks,
          createdBy: res?.createdBy,
          dcItemDetails: this.setDcItemList(res?.dcItemDetails),
        });

        this.expectedDate.patchValue(this.convertToNgbDate(res?.expectedDate));
        this.frlrDate.patchValue(this.convertToNgbDate(res?.frlrDate));
        this.expectedDate.disable();
        this.frlrDate.disable();

        this.challanDate = res?.creationDate.split('T')[0];

        this.selectedFilesBase64 = res?.dCDocumentsDetails;
        this.storedAttachments = res?.dCDocumentsDetails;
        const fileNames = this.selectedFilesBase64.map(
          (item: any) => item?.documentName,
        );
        this.selectedFilesnames.set(fileNames);

        this.challanFormGroup.get('destinationType')?.disable();
        this.challanFormGroup.get('transporterType')?.disable();
        this.isRGP = res?.challanType === 'RGP';
        this.loading.set(false);
      });
  }

  private setDcItemList(list: any[]) {
    if (list.length && list?.length === 0) return;
    for (let i = 0; i < list.length; i++) {
      if (i != 0) {
        this.addRowToItemlist();
      }

      this.itemList
        .at(i)
        .setValue({ ...list[i], actionBy: this.ACTION_BY_VALUE });
    }
  }

  protected downloadSingleAttachment(index: number) {
    const attachment = this.selectedFilesBase64[index];
    this.fileDownloaderService.openFileInNewTab({
      documentName: attachment?.documentName,
      documentData: attachment?.documentData,
    });
  }

  allowAlphaNumeric(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9]*$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  allowNumeric(event: KeyboardEvent) {
    const pattern = /^[0-9]$/; // only digits 0–9
    const inputChar = String.fromCharCode(event.keyCode || event.which);

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // block non-numeric
    }
  }

  protected onPressSubmit(approvedAction: string) {
    // if (!this.challanFormGroup.valid) {
    //   this.toastr.error('All required fields must be filled out.');
    //   return;
    // }

    if (approvedAction === 'Approved' && !this.itemList.valid) {
      this.toastr.error('Item Details can not be empty on Approval');
      return;
    } else if (
      approvedAction === 'Rejected' &&
      !this.challanFormGroup.get('approverRemarks')?.valid
    ) {
      this.toastr.error('Approver remarks can not be empty on Rejection');
      return;
    }
    const formValues = this.challanFormGroup.value;

    const payload = {
      approverAction: approvedAction,
      approverRemarks: formValues?.approverRemarks,
      approvedBy: this.ACTION_BY_VALUE,
      approvedOn: new Date().toISOString(),
      dcItemDetails: this.itemList.value,
    };

    this.updateDeliveryChallan(
      { ...payload, actionBy: this.actionBy },
      this.challanNumber(),
    );
  }
  updateDeliveryChallan(payload: any, challanNumber: string) {
    this.loading.set(true);
    this.deliveryChallanService
      .deliveryChallanApproval(payload, challanNumber)
      .subscribe(
        (res: any) => {
          this.toastr.success(
            `Delivery Challan with challan number: ${res?.challanNumber} is ${payload?.approverAction}.`,
          );
          this.loading.set(false);
          this.router.navigate([this.ROUTES.TRANSACTIONS.CHALLAN_APPROVAL]);
        },
        (err: any) => {
          if (err?.error?.details && err?.error?.details.length > 0) {
            err.error?.details.forEach((errValue: any) => {
              this.toastr.error(errValue.description);
            });
          } else {
            this.toastr.error('Something went wrong');
          }
          this.loading.set(false);
        },
      );
  }
}
