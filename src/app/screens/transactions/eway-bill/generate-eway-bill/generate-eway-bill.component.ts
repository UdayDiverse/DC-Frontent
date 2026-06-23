import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  input,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
import { distinctUntilChanged } from 'rxjs';
import { LOOKUPS } from '../../../../core/constants/lookups.constant';
import { ROUTEPATHS } from '../../../../core/constants/routes.constants';
import { CustomerService } from '../../../../core/service/customer.service';
import { DeliveryChallanService } from '../../../../core/service/delivery-challan.service';
import { LookupService } from '../../../../core/service/lookup.service';
import { PlantService } from '../../../../core/service/plant.service';
import { SubInventoryService } from '../../../../core/service/sub-inventory.service';
import { TransporterService } from '../../../../core/service/transporter.service';
import { LoggedInUserService } from '../../../../core/service/user.service';
import { VendorService } from '../../../../core/service/vendor.service';
import { FileDownloaderService } from '../../../../core/service/file-downloader.service';
import {
  NgbDatepickerModule,
  NgbModule,
  NgbDateStruct,
  NgbCalendar,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-generate-eway-bill',
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
  templateUrl: './generate-eway-bill.component.html',
  styleUrl: './generate-eway-bill.component.scss',
})
export class GenerateEwayBillComponent {
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
  deletedItems: any[] = [];
  deletedAttachments: any[] = [];
  storedAttachments: any[] = [];
  uploadedEwayBillDocument: any;
  fileDownloaderService = inject(FileDownloaderService);
  expandedSections = signal({
    basicInfo: false, // Default to expanded
    addressInfo: false,
    transporterDetails: false,
    ewayBillDetails: true,
    itemDetails: false,
  });
  isFormEdited = false;

  //Injecting Required services
  plantService = inject(PlantService);
  subinventoryService = inject(SubInventoryService);
  lookupService = inject(LookupService);
  vendorService = inject(VendorService);
  customerService = inject(CustomerService);
  transporterService = inject(TransporterService);
  userService = inject(LoggedInUserService);
  deliveryChallanService = inject(DeliveryChallanService);
  toastr = inject(ToastrService);
  router = inject(Router);

  plants = signal<any[]>([]);
  vendors = signal<any[]>([]);
  customers = signal<any[]>([]);
  transporters = signal<any[]>([]);
  vehicleSizes = signal<any[]>([]);
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
  ewayBillScreenType: 'create' | 'edit' = 'create';
  today = new Date().toISOString().split('T')[0];
  frlrDate = new FormControl<NgbDateStruct | null>(null);
  expectedDate = new FormControl<NgbDateStruct | null>(null);
  ewayBillDate = new FormControl<NgbDateStruct | null>(null);
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();
  isApiButtonDisabled = false;
  modalService = inject(NgbModal);
  selectedReason!: number;
  originalValues: any;
  isTransportDetailsEdited = false;
  originalTransportValues: any;
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;

  reasons = [
    {
      reason: 'DUPLICATE',
      value: 1,
    },
    {
      reason: 'ORDER_CANCELLED',
      value: 2,
    },
    {
      reason: 'DATA_ENTRY_MISTAKE',
      value: 3,
    },
    {
      reason: 'OTHERS',
      value: 4,
    },
  ];
  selectedOption: any = {};
  remarks: string = '';
  remarksField: string = '';
  eWayBillCreationFlag: string = '';

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
    transporterGstin: new FormControl(''),
    transporterName: new FormControl(''),
    vehicleNumber: new FormControl(''),
    vehicleSize: new FormControl(''),
    frlrNumber: new FormControl(''),
    travellingDistance: new FormControl(''),
    frlrDate: new FormControl(null),
    modeOfTransport: new FormControl(''),
    userRemarks: new FormControl(''),
    approverRemarks: new FormControl(''),
    // createdBy: new FormControl(this.loggedInUser(), Validators.required),
    dcItemDetails: new FormArray<FormGroup>([]),
    ewayBillFormGroup: new FormGroup({
      actionBy: new FormControl(this.ACTION_BY_VALUE, Validators.required),
      eWayBillCreationFlag: new FormControl('Manual', Validators.required),
      eWayBillNumber: new FormControl('', [
        Validators.minLength(12),
        Validators.required,
      ]),
      eWayBillType: new FormControl('Outward - Others', Validators.required),
      eWayBillAmount: new FormControl<number | null>(null, Validators.required),
      eWayBillDocumentName: new FormControl('', Validators.required),
      eWayBillDocumentContent: new FormControl('', Validators.required),
      ewayBillGenerationDate: new FormControl('', Validators.required),
    }),
  });

  constructor(private fb: FormBuilder) {
    this.addRowToItemlist();
    
  }

  ngOnInit() {
    this.getModeOfTransports();
    this.getTransporters();
    this.getVehicleSizes();

    if (this.challanNumber() != '') {
      this.getChallanAndBindToForms(this.challanNumber());
    }

    this.subscribeToEwayBillForm();
  }

  public get itemList() {
    return this.challanFormGroup.get('dcItemDetails') as FormArray;
  }

  public get ewaybillForm() {
    return this.challanFormGroup.get('ewayBillFormGroup') as FormGroup;
  }

  subscribeToEwayBillForm() {
    this.ewaybillForm.valueChanges.subscribe((val: any) => {
      const flag =
        (val.eWayBillNumber === '' || val.eWayBillNumber === null) &&
        (val.ewayBillGenerationDate === '' ||
          val.ewayBillGenerationDate === null) &&
        val.eWayBillDocumentContent === '';

      this.isApiButtonDisabled = !flag;
    });
  }

  onRemarksChange(event: any) {
    this.remarksField = event.target.value;
  }

  protected addRowToItemlist() {
    const fb = this.fb.group({
      id: [0],
      hsnCode: [''],
      descriptionModelNumber: [''],
      uom: [''],
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
      actionBy: this.actionBy,
    });
    this.itemList.push(fb);
  }

  protected removeItem(i: any) {
    if (this.itemList.length > 1) {
      const itemAtIndex = this.itemList.at(i);
      const deletedItem = {
        actionBy: this.actionBy,
        ...itemAtIndex.value,
        status: 'Inactive',
      };
      if (deletedItem?.id > 0) {
        this.deletedItems.push(deletedItem);
      }

      this.itemList.removeAt(i);
    }
  }

  onReasonSelection(event: any) {
    this.selectedReason = event.value;
  }

  toggleSection(
    section:
      | 'basicInfo'
      | 'addressInfo'
      | 'transporterDetails'
      | 'itemDetails'
      | 'ewayBillDetails',
  ) {
    this.expandedSections.update((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    if (this.challanNumber() != '') {
      this.deletedAttachments = this.storedAttachments.map((item: any) => {
        return {
          actionBy: this.actionBy,
          ...item,
          status: 'Inactive',
        };
      });
    }
    this.selectedFiles = Array.from(input.files);
    this.selectedFilesBase64 = [];
    for (let file of this.selectedFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.selectedFilesBase64.push({
          documentName: file?.name,
          documentData: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
    const filenames = [];
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      filenames.push(file.name);
    }
    this.selectedFilesnames.set(filenames);
  }

  onEwayBillDocumentUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (file && file.type !== 'application/pdf') {
      this.toastr.error('Only a PDF file can be uploaded');
      return;
    }

    if (file.size > 1024 * 1024) {
      //1 MB
      this.toastr.error("File size can't be greater than 1 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      this.uploadedEwayBillDocument = {
        eWayBillDocumentName: file?.name,
        eWayBillDocumentContent: base64String,
      };

      this.ewaybillForm.patchValue({
        eWayBillDocumentName: file?.name,
        eWayBillDocumentContent: base64String,
      });
    };
    reader.readAsDataURL(file);
  }

  formatDate = (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`; // YYYY-MM-DD
  };

  openModal() {
    const modalRef = this.modalService.open(this.confirmModal, {
      centered: true,
      size: 'sm',
    });

    modalRef.result.then((result) => {
      this.remarks = '';
      this.selectedOption = '';
      if (result === 'yes') {
        const payload = {
          challanNumber: this.challanNumber(),
          cancelRsnCode: this.selectedReason,
          remarks: this.remarksField || '',
          actionBy: this.actionBy,
        };

        this.loading.set(true);

        this.deliveryChallanService.cancelEwayBillViaApi(payload).subscribe(
          (res: any) => {
            this.loading.set(false);
            this.toastr.success(
              `Eway Bill against Challan number ${res?.challanNumber} is cancelled.`,
            );
            this.router.navigate([
              this.ROUTES.TRANSACTIONS.EWAY_BILL_GENERATION,
            ]);
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
    });
  }

  cancelEwayBill() { }

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
          transporterName: res?.transporterName,
          transporterGstin: res?.transporterGstin,
          vehicleNumber: res?.vehicleNumber,
          vehicleSize: res?.vehicleSize,
          frlrNumber: res?.frlrNumber,
          travellingDistance: res?.travellingDistance,
          frlrDate: res?.frlrDate?.split('T')[0],
          modeOfTransport: res?.modeOfTransport,
          userRemarks: res?.userRemarks,
          approverRemarks: res?.approverRemarks,
          createdBy: res?.createdBy,
          dcItemDetails: this.setDcItemList(res?.dcItemDetails),
        });

        this.originalValues = this.challanFormGroup.getRawValue();
        this.originalTransportValues = {
          transporterCode: res?.transporterCode,
          vehicleNumber: res?.vehicleNumber,
          vehicleSize: res?.vehicleSize,
          frlrNumber: res?.frlrNumber,
          frlrDate: res?.frlrDate?.split('T')[0],
          travellingDistance: res?.travellingDistance
        };


        this.eWayBillCreationFlag = res?.eWayBillCreationFlag;

        this.expectedDate.patchValue(this.convertToNgbDate(res?.expectedDate));
        this.frlrDate.patchValue(this.convertToNgbDate(res?.frlrDate));
        this.expectedDate.disable();
        this.frlrDate.enable();

        this.ewaybillForm.patchValue({
          eWayBillAmount: this.getEwayBillAmount(res?.dcItemDetails),
        });

        if (res?.eWayBillNumber && res?.eWayBillNumber !== '') {
          this.ewayBillDate.patchValue(
            this.convertToNgbDate(this.formatDate(res?.ewayBillGenerationDate)),
          );
          this.ewaybillForm.patchValue({
            eWayBillNumber: res?.eWayBillNumber,
            eWayBillType: res?.eWayBillType,
            eWayBillDocumentName: res?.eWayBillDocumentName,
            eWayBillDocumentContent: res?.eWayBillDocumentContent,
            ewayBillGenerationDate: this.formatDate(
              res?.ewayBillGenerationDate,
            ),
          });

          this.uploadedEwayBillDocument = {
            eWayBillDocumentName: res?.eWayBillDocumentName,
            eWayBillDocumentContent: res?.eWayBillDocumentContent,
          };

          this.ewayBillScreenType = 'edit';
        }
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
        this.trackTransportChanges();
      });
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

  onDateSelect(date: NgbDateStruct, type: string) {
    const month = Number(date.month) < 10 ? '0' + date.month : date.month;
    const day = Number(date.day) < 10 ? '0' + date.day : date.day;
    const formattedDate =
      date.year + '-' + month.toString() + '-' + day.toString();
    if (type === 'ewayBillDate') {
      this.ewaybillForm.patchValue({
        ewayBillGenerationDate: formattedDate,
      });
    }
  }

  onNumberInput(event: any) {
    const value = event.target.value;
    if (value.length > 12) {
      event.target.value = value.slice(0, 12);
      this.ewaybillForm.get('eWayBillNumber')?.setValue(event.target.value);
    }
  }

  blockInvalid(e: KeyboardEvent) {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  }

  private setDcItemList(list: any[]) {
    if (list.length && list?.length === 0) return;
    for (let i = 0; i < list.length; i++) {
      if (i != 0) {
        this.addRowToItemlist();
      }

      this.itemList.at(i).setValue(list[i]);
    }
  }

  protected getEwayBillAmount(list: any[]) {
    if (list.length && list?.length === 0) return;
    return list.reduce(
      (totalAmount, item) => item?.totalAmount + totalAmount,
      0,
    );
  }

  protected downloadSingleAttachment(index: number) {
    const attachment = this.selectedFilesBase64[index];
    this.fileDownloaderService.openFileInNewTab({
      documentName: attachment?.documentName,
      documentData: attachment?.documentData,
    });
  }
  protected downloadUploadedEwayBill(): void {
    if (this.eWayBillCreationFlag === 'Manual') {
      if (
        this.uploadedEwayBillDocument?.eWayBillDocumentName &&
        this.uploadedEwayBillDocument?.eWayBillDocumentContent
      ) {
        this.fileDownloaderService.openFileInNewTab({
          documentName: this.uploadedEwayBillDocument.eWayBillDocumentName,
          documentData: this.uploadedEwayBillDocument.eWayBillDocumentContent,
        });
      } else {
        console.warn('No E-Way Bill document available to download.');
      }
    } else {
      const url = this.uploadedEwayBillDocument?.eWayBillDocumentName;
      window.open(url, '_blank');
    }
  }

  allowNumeric(event: KeyboardEvent) {
    const pattern = /^[0-9]$/; // only digits 0–9
    const inputChar = String.fromCharCode(event.keyCode || event.which);

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // block non-numeric
    }
  }

  generateViaApi() {
    this.loading.set(true);
    this.deliveryChallanService
      .generateEwayBillViaApi({
        challanNumber: this.challanNumber(),
        actionBy: this.actionBy,
      })
      .subscribe(
        (res: any) => {
          this.toastr.success(
            `Eway Bill is generated challan number: ${res?.challanNumber}`,
          );
          this.loading.set(false);
          this.router.navigate([this.ROUTES.TRANSACTIONS.EWAY_BILL_GENERATION]);
        },
        (err: any) => {
          if (err?.error?.details && err?.error?.details.length > 0) {
            err.error?.details.forEach((errValue: any) => {
              const ewayBillErrorString =
                // 'Failed for document no: AO2NRGP261000055, Invalid HSN Code, The distance between the given pincodes are not available in the system. Please provide distance';
                errValue.elementValue;
              const ewayBillErrors: string[] = ewayBillErrorString.split(',');
              ewayBillErrors.forEach((ewayBillError: string) => {
                this.toastr.error(ewayBillError.trim());
              });
            });
          } else {
            this.toastr.error('Something went wrong');
          }
          this.loading.set(false);
        },
      );
  }

  protected onPressSubmit() {
    // this.ewaybillForm.patchValue({
    //   ewayBillGenerationDate: new Date().toISOString(),
    // });
    // if (!this.ewaybillForm.valid) {
    //   this.toastr.error(
    //     'All e-Way fields must be filled out. including attachment'
    //   );
    //   return;
    // }

    // this.ewaybillForm.patchValue({
    //   ewayBillCreationDate: new Date().toISOString(),
    //   ewayBillLastUpdateDate: new Date().toISOString(),
    //   ewayBillCreatedBy: this.userService.getUserId(),
    //   ewayBillLastUpdatedBy: this.userService.getUserId(),
    // });

    let payload = {
      ...this.ewaybillForm.value,
      ...this.uploadedEwayBillDocument,
    };

    payload = {
      ...payload,
      eWayBillNumber: payload?.eWayBillNumber.toString(),
    };

    if (this.ewayBillScreenType === 'create') {
      this.createEwaybillManually(payload);
    } else {
      this.updateEwaybillManually(payload);
    }
  }

  createEwaybillManually(payload: any) {
    this.loading.set(true);
    this.deliveryChallanService
      .createEwaybillManually(payload, this.challanNumber())
      .subscribe(
        (res: any) => {
          this.toastr.success(
            `Eway Bill details are saved against challan number: ${res?.challanNumber}`,
          );
          this.loading.set(false);
          this.router.navigate([this.ROUTES.TRANSACTIONS.EWAY_BILL_GENERATION]);
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
  updateEwaybillManually(payload: any) {
    this.loading.set(true);
    this.deliveryChallanService
      .updateEwaybillManually(payload, this.challanNumber())
      .subscribe(
        (res: any) => {
          this.toastr.success(
            `Eway Bill details are updated against challan number: ${res?.challanNumber}`,
          );
          this.loading.set(false);
          this.router.navigate([this.ROUTES.TRANSACTIONS.EWAY_BILL_GENERATION]);
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

  clearDate() {
    this.ewayBillDate.reset();
    this.challanFormGroup
      .get('ewayBillFormGroup')
      ?.get('ewayBillGenerationDate')
      ?.setValue(null);
  }


  protected onTransporterSelection(transporterCode: any) {
    const transporter = this.transporters().find(
      (item: any) => item?.code === transporterCode?.code,
    );
    this.challanFormGroup.patchValue({
      transporterName: transporter?.name,
      transporterGstin: transporter?.gstInNo,
    });
  }

  private getTransporters() {
    this.transporterService
      .getTransporters({ status: 'A' }, 0, 0)
      .subscribe((res: any) => {
        this.transporters.set(res?.transporters);
      });
  }

  private getVehicleSizes() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.vehicleSizes)
      .subscribe((res: any) => {
        this.vehicleSizes.set(res?.lookUps);
      });
  }


  onTransportDetailsUpdate() {
    const currentValues = this.challanFormGroup.getRawValue();

    if (this.originalValues) {
      const differences: any = {};
      const unchanged: any = {};

      Object.keys(currentValues).forEach(key => {
        if (this.originalValues[key] !== currentValues[key]) {
          differences[key] = {
            old: this.originalValues[key],
            new: currentValues[key]
          };
        } else {
          unchanged[key] = currentValues[key];
        }
      });
      const payload = {
        ...this.challanFormGroup.value,
        dcItemDetails: [...this.itemList.value, ...this.deletedItems],
        dCDocumentsRequestModels: [
          ...this.selectedFilesBase64,
          ...this.deletedAttachments,
        ],
      };
      if (this.challanNumber() != null) {
        this.updateDeliveryChallan(
          { ...payload, status: 'OPEN' },
          this.challanNumber(),
        );
      }
    }
  }



  trackTransportChanges() {
    this.challanFormGroup.valueChanges.subscribe(currentValues => {
      const keysToCheck = [
        'transporterCode',
        'vehicleNumber',
        'vehicleSize',
        'frlrNumber',
        'frlrDate',
        'travellingDistance'
      ];

      let hasChanges = false;

      keysToCheck.forEach(key => {
        if (JSON.stringify(this.originalTransportValues[key]) !== JSON.stringify(currentValues[key])) {
          hasChanges = true;
        }
      });
      this.isTransportDetailsEdited = hasChanges;
    });
  }



  updateDeliveryChallan(payload: any, challanNumber: string) {
    this.loading.set(true);
    const actionByValue = payload?.ewayBillFormGroup?.actionBy;
    const updatedPayload = {
      ...payload,
      destinationType: this.destinationType,
      dcItemDetails: payload.dcItemDetails.map((item: any) => ({
        ...item,
        actionBy: item.actionBy ?? actionByValue,
      })),
      ewayBillFormGroup: {
        ...payload.ewayBillFormGroup,
        actionBy: actionByValue,
      },
      transporterType: "Registered",
      actionBy: actionByValue,
      status: "CONTROL_OUTGOING",
    };

    this.deliveryChallanService
      .updateDeliveryChallan(updatedPayload, challanNumber)
      .subscribe(
        (res: any) => {
          this.toastr.success(
            `Delivery Challan is Updated Successfully for challan number: ${res?.challanNumber}`,
          );
          this.loading.set(false);
          this.router.navigate([this.ROUTES.TRANSACTIONS.EWAY_BILL_GENERATION]);
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
