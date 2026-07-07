import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PlantService } from '../../../core/service/plant.service';
import { SubInventoryService } from '../../../core/service/sub-inventory.service';
import { LookupService } from '../../../core/service/lookup.service';
import { VendorService } from '../../../core/service/vendor.service';
import { CustomerService } from '../../../core/service/customer.service';
import { LoggedInUserService } from '../../../core/service/user.service';
import { TransporterService } from '../../../core/service/transporter.service';
import { LOOKUPS } from '../../../core/constants/lookups.constant';
import { DeliveryChallanService } from '../../../core/service/delivery-challan.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { ROUTEPATHS } from '../../../core/constants/routes.constants';
import { distinctUntilChanged } from 'rxjs';
import { FileDownloaderService } from '../../../core/service/file-downloader.service';
import {
  NgbAccordionModule,
  NgbCalendar,
  NgbDatepickerModule,
  NgbDateStruct,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AuthGuard } from '../../../core/guards/auth.guard';

@Component({
  selector: 'app-delivery-challan-creation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    RouterLink,
    NgbDatepickerModule,
    NgbModule,
    NgbAccordionModule,
  ],
  templateUrl: './delivery-challan-creation.component.html',
  styleUrl: './delivery-challan-creation.component.scss',
  animations: [
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({ height: '0px', overflow: 'hidden', opacity: 0 }),
      ),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', animate('300ms ease')),
    ]),
  ],
})
export class DeliveryChallanCreationComponent {
  ROUTES = ROUTEPATHS;
  challanNumber = input<string>('');

  // Accordion state management
  expandedSections = signal({
    basicInfo: true, // Default to expanded
    addressInfo: false,
    transporterDetails: false,
    itemDetails: false,
  });

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
  MAX_ATTACHMENT_SIZE_MB = 2;
  sourcePlantCode: string = "";

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
  fileDownloaderService = inject(FileDownloaderService);

  sourcePlants = signal<any[]>([]);
  destinationPlants = signal<any[]>([]);
  immutableDestinationPlants: any[] = [];
  vendors = signal<any[]>([]);
  // customers = signal<any[]>([]);
  customers: any[] = [];
  transporters = signal<any[]>([]);
  vehicleSizes = signal<any[]>([]);
  states = signal<any[]>([]);
  itemCategories = signal<any[]>([]);
  subInventories = signal<any[]>([]);
  challanTypes = signal<any[]>([]);
  modeOfTransports = signal<any[]>([]);
  uom = signal<any[]>([]);
  department = this.userService.getDepartment();
  loggedInUser = this.userService.getLoggedInUser();
  ACTION_BY_VALUE = this.userService.getUserId();
  plantsForLoggedInUser = this.userService.getPlantsForLoggedInUser();
  isVehicleNumberValid = true;
  frlrDate = new FormControl<NgbDateStruct | null>(null);
  expectedDate = new FormControl<NgbDateStruct | null>(null);
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();
  actionBy = this.userService.getUserId();
  isRegistered = true;
  isRGP = false;
  loading = signal(false);
  challanDate = '';
  items = [
    {
      title: 'Basic Information',
      content: 'This is the first accordion content.',
      expanded: true,
    },
    {
      title: 'Destination Details',
      content: 'This is the second accordion content.',
      expanded: false,
    },
    {
      title: 'Transporter Details',
      content: 'This is the third accordion content.',
      expanded: false,
    },
    {
      title: 'Item Details',
      content: 'This is the third accordion content.',
      expanded: false,
    },
  ];
  isPostalCodeValid: boolean = true;

  toggle(index: number) {
    this.items[index].expanded = !this.items[index].expanded;
  }

  challanFormGroup: FormGroup = new FormGroup({
    plantName: new FormControl(''),
    plantCode: new FormControl('', Validators.required),
    branchName: new FormControl('', Validators.required),
    subinventoryCode: new FormControl('', Validators.required),
    subinventoryName: new FormControl(''),
    challanType: new FormControl('', Validators.required),
    itemCategory: new FormControl('', Validators.required),
    status: new FormControl('OPEN', Validators.required),
    department: new FormControl(this.department, Validators.required),
    expectedDate: new FormControl(null),
    destinationType: new FormControl('Plant', Validators.required),
    destinationCode: new FormControl('', Validators.required),
    destinationName: new FormControl('', Validators.required),
    destinationAddress1: new FormControl('', Validators.required),
    destinationAddress2: new FormControl(''),
    destinationCity: new FormControl(''),
    destinationState: new FormControl(''),
    destinationPostalCode: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ]),

    destinationGstin: new FormControl('', Validators.required),
    transporterType: new FormControl('Registered', Validators.required),
    transporterCode: new FormControl('', Validators.required),
    transporterName: new FormControl('', Validators.required),
    transporterGstin: new FormControl('', Validators.required),
    vehicleNumber: new FormControl('', Validators.required),
    vehicleSize: new FormControl('', Validators.required),
    frlrNumber: new FormControl(''),
    frlrDate: new FormControl(null),
    travellingDistance: new FormControl(0, [Validators.maxLength(6)]),
    modeOfTransport: new FormControl('', Validators.required),
    userRemarks: new FormControl(''),
    // createdBy: new FormControl(this.loggedInUser(), Validators.required),
    dcItemDetails: new FormArray<FormGroup>([]),
    actionBy: new FormControl(this.ACTION_BY_VALUE, Validators.required),
  });

  constructor(private fb: FormBuilder) {
    this.addRowToItemlist();
  }

  ngOnInit() {
    this.getSourcePlants();
    this.getDestinationPlants();
    this.getVendors();
    this.getCustomers();
    this.getChallanTypes();
    this.getVehicleSizes();
    this.getStates();
    this.getTransporters();
    this.getUOM();
    // this.getSubinventories();
    this.getModeOfTransports();
    this.getGetItemCategories();

    this.subscribeToValidations();
    this.subscribeToChallanType();
    this.subscribeToTransporterType();

    if (this.challanNumber() != null) {
      this.getChallanAndBindToForms(this.challanNumber() as string);
    }
  }
  // Accordion toggle method
  toggleSection(
    section: 'basicInfo' | 'addressInfo' | 'transporterDetails' | 'itemDetails',
  ) {
    this.expandedSections.update((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }
  public get itemList() {
    return this.challanFormGroup.get('dcItemDetails') as FormArray;
  }

  protected addRowToItemlist() {
    const fb = this.fb.group({
      id: [0],
      hsnCode: ['', [Validators.minLength(4), Validators.maxLength(8)]],
      descriptionModelNumber: ['', Validators.required],
      uom: ['', Validators.required],
      quantity: [
        0,
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]
      ],
      unitPrice: [
        0,
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]
      ],

      sgstPercentage: [0],
      sgstAmount: [0],
      cgstPercentage: [0],
      cgstAmount: [0],
      igstPercentage: [0],
      igstAmount: [0],
      totalAmount: [0],
      // gateInItemsDetails: [[]],
      status: ['Active', Validators.required],
      actionBy: [this.actionBy, Validators.required],
    });
    this.itemList.push(fb);
    this.subscribeToItemCalculations(fb);
    this.subscribeToGSTs(fb);
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

  onDateSelect(date: NgbDateStruct, type: string) {
    const month = Number(date.month) < 10 ? '0' + date.month : date.month;
    const day = Number(date.day) < 10 ? '0' + date.day : date.day;
    const formattedDate =
      date.year + '-' + month.toString() + '-' + day.toString();
    if (type === 'frlrDate') {
      this.challanFormGroup.patchValue({
        frlrDate: formattedDate,
      });
    } else if (type === 'expectedDate') {
      this.challanFormGroup.patchValue({
        expectedDate: formattedDate,
      });
    }
  }

  onChallanTypeChange(evt: any) {
    const control = this.challanFormGroup.get(
      'expectedDate',
    ) as AbstractControl | null;

    if (!control) {
      console.error(
        'expectedDate control not found on challanFormGroup',
        this.challanFormGroup,
      );
      return;
    }
    control.enable({ onlySelf: true, emitEvent: false });
    control.reset(
      { value: null, disabled: false },
      { onlySelf: true, emitEvent: false },
    );
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

  private subscribeToItemCalculations(fg: FormGroup) {
    const unitPriceFC = fg.get('unitPrice');
    const sgstPercentageFC = fg.get('sgstPercentage');
    const cgstPercentageFC = fg.get('cgstPercentage');
    const igstPercentageFC = fg.get('igstPercentage');
    const quantityFC = fg.get('quantity');

    const doCalculations = () => {
      const price = +unitPriceFC?.value || 0;
      const quantity = +quantityFC?.value || 0;
      const sgstRate = +sgstPercentageFC?.value || 0;
      const cgstRate = +cgstPercentageFC?.value || 0;
      const igstRate = +igstPercentageFC?.value || 0;
      const sgst = Number(((sgstRate * price * quantity) / 100).toFixed(2));
      const cgst = Number(((cgstRate * price * quantity) / 100).toFixed(2));
      const igst = Number(((igstRate * price * quantity) / 100).toFixed(2));

      fg.get('sgstAmount')?.setValue(sgst);
      fg.get('cgstAmount')?.setValue(cgst);
      fg.get('igstAmount')?.setValue(igst);

      const totalAmount = Number(
        (price * quantity + sgst + cgst + igst).toFixed(2),
      );
      fg.get('totalAmount')?.setValue(totalAmount);
    };

    unitPriceFC?.valueChanges.subscribe(doCalculations);
    quantityFC?.valueChanges.subscribe(doCalculations);
    sgstPercentageFC?.valueChanges.subscribe(doCalculations);
    cgstPercentageFC?.valueChanges.subscribe(doCalculations);
    igstPercentageFC?.valueChanges.subscribe(doCalculations);
  }

  private subscribeToValidations() {
    this.challanFormGroup
      .get('destinationType')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((type: any) => {
        if (this.challanNumber() != null) {
          this.challanFormGroup
            .get('destinationType')
            ?.patchValue(this.destinationType, { emitEvent: false });

          this.challanFormGroup.get('destinationType')?.disable();
        } else {
          this.challanFormGroup.get('destinationType')?.enable();
          this.challanFormGroup.patchValue({
            destinationCode: '',
            destinationName: '',
            destinationAddress1: '',
            destinationAddress2: '',
            destinationCity: '',
            destinationState: '',
            destinationPostalCode: '',
            destinationGstin: '',
          });
          this.destinationType = type;
        }

        this.isRegistered = !(
          this.destinationType === 'Unregistered Vendor' ||
          this.destinationType === 'Unregistered Customer'
        );

        const destinationCodeControl =
          this.challanFormGroup.get('destinationCode');

        if (this.isRegistered) {
          destinationCodeControl?.setValidators([Validators.required]);
        } else {
          destinationCodeControl?.clearValidators();
        }
        destinationCodeControl?.updateValueAndValidity({ emitEvent: false });
      });
  }

  private subscribeToChallanType() {
    this.challanFormGroup
      .get('challanType')
      ?.valueChanges.subscribe((type: any) => {
        this.isRGP = type === 'RGP';

        const expectedDateControl = this.challanFormGroup.get('expectedDate');

        if (this.isRGP) {
          // When RGP selected → make Expected Date mandatory
          expectedDateControl?.setValidators([Validators.required]);
        } else {
          // When switched to NRGP or any non-RGP → remove validator + clear value
          expectedDateControl?.clearValidators();
          expectedDateControl?.setValue(null); // clear date
          this.expectedDate.setValue(null);
        }

        expectedDateControl?.updateValueAndValidity({ emitEvent: false });
      });
  }

  private subscribeToTransporterType() {
    this.challanFormGroup
      .get('transporterType')
      ?.valueChanges.subscribe((type: any) => {
        this.challanFormGroup.patchValue({
          transporterCode: '',
          transporterName: '',
          transporterGstin: '',
        });
        this.transporterType = type;

        if (this.transporterType === 'Registered') {
          this.challanFormGroup
            .get('transporterCode')
            ?.setValidators([Validators.required]);
          this.challanFormGroup
            .get('transporterGstin')
            ?.setValidators([Validators.required]);
          // this.challanFormGroup
          //   .get('frlrNumber')
          //   ?.setValidators([Validators.required]);
          this.challanFormGroup
            .get('vehicleNumber')
            ?.setValidators([Validators.required]);
          this.challanFormGroup
            .get('vehicleSize')
            ?.setValidators([Validators.required]);
          // this.challanFormGroup
          //   .get('frlrDate')
          //   ?.setValidators([Validators.required]);
          this.challanFormGroup
            .get('travellingDistance')
            ?.setValidators([Validators.required]);
        } else {
          this.challanFormGroup.get('transporterCode')?.clearValidators();
          this.challanFormGroup.get('transporterGstin')?.clearValidators();
          // this.challanFormGroup.get('frlrNumber')?.clearValidators();
          this.challanFormGroup.get('vehicleNumber')?.clearValidators();
          this.challanFormGroup.get('vehicleSize')?.clearValidators();
          // this.challanFormGroup.get('frlrDate')?.clearValidators();
          this.challanFormGroup.get('travellingDistance')?.clearValidators();
        }

        this.challanFormGroup
          .get('transporterCode')
          ?.updateValueAndValidity({ emitEvent: false });
        this.challanFormGroup
          .get('transporterGstin')
          ?.updateValueAndValidity({ emitEvent: false });
        // this.challanFormGroup
        //   .get('frlrNumber')
        //   ?.updateValueAndValidity({ emitEvent: false });
        this.challanFormGroup
          .get('vehicleNumber')
          ?.updateValueAndValidity({ emitEvent: false });
        this.challanFormGroup
          .get('vehicleSize')
          ?.updateValueAndValidity({ emitEvent: false });
        // this.challanFormGroup
        //   .get('frlrDate')
        //   ?.updateValueAndValidity({ emitEvent: false });
        this.challanFormGroup
          .get('travellingDistance')
          ?.updateValueAndValidity({ emitEvent: false });
      });
  }


  subscribeToGSTs(group: FormGroup) {
    const cgstCtrl = group.get('cgstPercentage');
    const sgstCtrl = group.get('sgstPercentage');
    const igstCtrl = group.get('igstPercentage');

    // Watch CGST + SGST
    cgstCtrl?.valueChanges.subscribe((val) => {
      if (
        (val === null || val === '' || val.toString() === '0') &&
        (sgstCtrl?.value === null ||
          sgstCtrl?.value === '' ||
          sgstCtrl?.value.toString() === '0')
      ) {
        igstCtrl?.enable({ emitEvent: false });
      } else {
        igstCtrl?.disable({ emitEvent: false });
        igstCtrl?.setValue('0', { emitEvent: false });
      }
      sgstCtrl?.setValue(val);
    });

    // Watch SGST
    sgstCtrl?.valueChanges.subscribe((val) => {
      if (
        (val === null || val === '' || val.toString() === '0') &&
        (cgstCtrl?.value === null ||
          cgstCtrl?.value === '' ||
          cgstCtrl?.value.toString() === '0')
      ) {
        igstCtrl?.enable({ emitEvent: false });
      } else {
        igstCtrl?.disable({ emitEvent: false });
        igstCtrl?.setValue('0', { emitEvent: false });
      }
      cgstCtrl?.setValue(val);
    });

    // Watch IGST
    igstCtrl?.valueChanges.subscribe((val) => {
      if (val === null || val === '' || val.toString() === '0') {
        cgstCtrl?.enable({ emitEvent: false });
        sgstCtrl?.enable({ emitEvent: false });
      } else {
        cgstCtrl?.disable({ emitEvent: false });
        sgstCtrl?.disable({ emitEvent: false });
        cgstCtrl?.setValue('0', { emitEvent: false });
        sgstCtrl?.setValue('0', { emitEvent: false });
      }
    });
  }

  allowAlphaNumeric(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9 ]*$/;
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
  validateVehicleNumber(event: any) {
    const vehicleNumber = event.target.value.toUpperCase();
    event.target.value = vehicleNumber;
    const pattern = /^[A-Z0-9]+$/;
    const isLengthValid = vehicleNumber.length >= 8 && vehicleNumber.length <= 10;
    this.isVehicleNumberValid =
      vehicleNumber === '' || (pattern.test(vehicleNumber) && isLengthValid);
  }

  protected onTransporterChange(event: any) {
    this.challanFormGroup.patchValue({
      transporterCode: '',
      transporterName: '',
      vehicleNumber: '',
      vehicleSize: '',
      frlrNumber: '',
      frlrDate: null,
    });
    this.transporterType = event.target.value;
  }

  private getSourcePlants() {
    this.plantService
      .getPlants(
        {
          plantCode: this.plantsForLoggedInUser,
        },
        0,
        0,
      )
      .subscribe((res: any) => {
        this.sourcePlants.set(res?.plants);
      });
  }
  private getDestinationPlants() {
    this.plantService.getPlants({}, 0, 0).subscribe((res: any) => {
      this.immutableDestinationPlants = res?.plants;
      if (this.challanNumber !== null) {
        this.destinationPlants.set(res?.plants);
      }
    });
  }

  private getFilteredDestinationPlants(plantCode: string) {
    this.destinationPlants.set(
      this.immutableDestinationPlants.filter(
        (item: any) => item?.plantCode !== plantCode,
      ),
    );
  }

  private getVendors() {
    this.vendorService
      .getVendors({ status: 'A' }, 0, 0)
      .subscribe((res: any) => {
        this.vendors.set(res?.vendors);
      });
  }
  private getCustomers() {
    this.customerService
      .getCustomers({ status: 'A' }, 0, 0)
      .subscribe((res: any) => {
        this.customers = res?.customers;
      });
  }
  private getTransporters() {
    this.transporterService
      .getTransporters({ status: 'A' }, 0, 0)
      .subscribe((res: any) => {
        this.transporters.set(res?.transporters);
      });
  }
  private getSubinventories(plantCode: string) {
    this.subinventoryService
      .getSubInventories({ plantCodes: [plantCode] }, 0, 0)
      .subscribe((res: any) => {
        this.subInventories.set(res?.subInventories);
      });
  }
  private getChallanTypes() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.challanType)
      .subscribe((res: any) => {
        this.challanTypes.set(res?.lookUps);
      });
  }
  private getVehicleSizes() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.vehicleSizes)
      .subscribe((res: any) => {
        this.vehicleSizes.set(res?.lookUps);
      });
  }

  private getStates() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.states)
      .subscribe((res: any) => {
        this.states.set(res?.lookUps);
      });
  }

  private getGetItemCategories() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.itemCategory)
      .subscribe((res: any) => {
        this.itemCategories.set(res?.lookUps);
      });
  }
  private getModeOfTransports() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.modeOfTransport)
      .subscribe((res: any) => {
        this.modeOfTransports.set(
          res?.lookUps
            .filter((item: any) => item.code)
            .sort((a: any, b: any) => a.code.localeCompare(b.code))
        );
      });
  }
  private getUOM() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.uom)
      .subscribe((res: any) => {
        this.uom.set(res?.lookUps);
        console.log(this.uom()[0].code);
      });
  }

  protected onSourcePlantSelection(plantCode: string) {
    const plant = this.sourcePlants().find(
      (item: any) => item?.plantCode === plantCode,
    );
    this.sourcePlantCode = plant?.postal;
    const destType = this.challanFormGroup.get('destinationType')?.value;
    const destCode = this.challanFormGroup.get('destinationCode')?.value;

    this.challanFormGroup.patchValue({
      branchName: plant?.businessArea,
      plantName: plant?.plantName,
    });

    if (destType === 'Plant' && destCode === plantCode) {
      this.challanFormGroup.patchValue({
        destinationCode: '',
        destinationName: '',
        destinationCity: '',
        destinationAddress1: '',
        destinationAddress2: '',
        destinationState: '',
        destinationPostalCode: '',
        destinationGstin: '',
      });
    }

    this.getSubinventories(plantCode);

    this.getFilteredDestinationPlants(plantCode);
  }

  protected onSubInventorySelection(subinventoryCode: number) {
    const subinventory = this.subInventories().find(
      (item: any) => item?.subInventoryCode === subinventoryCode,
    );
    this.challanFormGroup.patchValue({
      subinventoryName: subinventory?.subInventoryDesc,
    });
  }

  protected onPlantSelection(plant: any) {
    if (this.sourcePlantCode && plant?.postal && this.sourcePlantCode === plant?.postal) {
      this.challanFormGroup.patchValue({ travellingDistance: 40 });
    } else {
      this.challanFormGroup.patchValue({ travellingDistance: 0 });
    }
    this.challanFormGroup.patchValue({
      destinationCode: plant?.plantCode,
      destinationName: plant?.plantName,
      destinationAddress1: plant?.plantAddress1,
      destinationAddress2: plant?.plantAddress2,
      destinationCity: plant?.plantAddress3,
      destinationState: plant?.state,
      destinationPostalCode: plant?.postal,
      destinationGstin: plant?.gstNo,
    });
  }
  protected onVendorSelection(vendorCode: any) {
    const vendor = this.vendors().find(
      (item: any) => item?.code === vendorCode?.code,
    );
    this.challanFormGroup.patchValue({
      destinationName: vendor?.name,
      destinationAddress1: vendor?.address1,
      destinationAddress2: vendor?.address2,
      destinationCity: vendor?.city,
      destinationState: vendor?.state,
      destinationPostalCode: vendor?.postalCode,
      destinationGstin: vendor?.gstInNo,
    });
  }
  protected onCustomerSelection(customerCode: any) {
    const customer: any = this.customers.find(
      (item: any) => item?.customerCode === customerCode?.customerCode,
    );
    this.challanFormGroup.patchValue({
      destinationName: customer?.customerName,
      destinationAddress1: customer?.customerAddress1,
      destinationAddress2: customer?.customerAddress2,
      destinationCity: customer?.city,
      destinationState: customer?.state,
      destinationPostalCode: customer?.postal,
      destinationGstin: customer?.gstnNo,
    });
  }

  protected onTransporterSelection(transporterCode: any) {
    console.log(transporterCode);

    const transporter = this.transporters().find(
      (item: any) => item?.code === transporterCode?.code,
    );
    this.challanFormGroup.patchValue({
      transporterName: transporter?.name,
      transporterGstin: transporter?.gstInNo,
    });
  }

  protected downloadSingleAttachment(index: number) {
    const attachment = this.selectedFilesBase64[index];
    this.fileDownloaderService.openFileInNewTab({
      documentName: attachment?.documentName,
      documentData: attachment?.documentData,
    });
  }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    if (input.files.length > 4) {
      this.toastr.error(`Can't upload more than 4 files`);
      return;
    }

    if (this.challanNumber() != null) {
      this.deletedAttachments = this.storedAttachments.map((item: any) => {
        return {
          actionBy: this.actionBy,
          ...item,
          status: 'Inactive',
        };
      });
    }

    this.selectedFiles = Array.from(input.files);

    const totalSize = this.selectedFiles.reduce(
      (sum, file) => sum + file?.size,
      0,
    );

    if (totalSize > this.MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
      this.toastr.error(
        `Total size of attachments can't be more than ${this.MAX_ATTACHMENT_SIZE_MB} MB`,
      );
      return;
    }

    this.selectedFilesBase64 = [];

    for (let file of this.selectedFiles) {
      if (file && file.type !== 'application/pdf') {
        this.toastr.error('Only a PDF file can be uploaded');
        continue;
      }
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.selectedFilesBase64.push({
          documentName: file?.name,
          documentData: base64String,
          status: 'Active',
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

  getChallanAndBindToForms(challanNumber: string) {
    this.loading.set(true);

    this.deliveryChallanService
      .getChallanByChallanNumber(challanNumber)
      .subscribe((res: any) => {
        this.destinationType = res?.destinationType;
        this.challanFormGroup.get('destinationType')?.enable();
        this.getSubinventories(res?.plantCode);
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
          createdBy: res?.createdBy,
          dcItemDetails: this.setDcItemList(res?.dcItemDetails),
        });

        this.expectedDate.patchValue(this.convertToNgbDate(res?.expectedDate));
        this.frlrDate.patchValue(this.convertToNgbDate(res?.frlrDate));

        this.challanDate = res?.creationDate.split('T')[0];

        this.selectedFilesBase64 = res?.dCDocumentsDetails?.map((doc: any) => ({
          ...doc,
          status: 'Active',
        }));
        this.storedAttachments = res?.dCDocumentsDetails?.map((doc: any) => ({
          ...doc,
          status: 'Active',
        }));
        const fileNames = this.selectedFilesBase64.map(
          (item: any) => item?.documentName,
        );
        this.selectedFilesnames.set(fileNames);
        this.loading.set(false);
      });
  }

  private setDcItemList(list: any[]) {
    if (list.length && list?.length === 0) return;
    for (let i = 0; i < list.length; i++) {
      if (i != 0) {
        this.addRowToItemlist();
      }

      this.itemList.at(i).setValue({ ...list[i], actionBy: this.actionBy });
    }
  }

  protected onPressSubmit() {
    // if (!this.challanFormGroup.valid) {
    //   this.toastr.error('Please fill all the mandatory fields marked with *');
    //   return;
    // }
    const payload = {
      ...this.challanFormGroup.value,
      dcItemDetails: [...this.itemList.value, ...this.deletedItems],
      dCDocumentsRequestModels: [
        ...this.selectedFilesBase64,
        ...this.deletedAttachments,
      ],
    };
    let hasError = false;
    if (
      payload.destinationGstin === null ||
      payload.destinationGstin === "NA" ||
      payload.destinationGstin === "N/A"
    ) {
      this.toastr.error('GSTIN No. cannot be Null.');
      hasError = true;
    }
    if (payload.destinationPostalCode === null) {
      this.toastr.error('Postal Code cannot be Null.');
      hasError = true;
    }
    if (!hasError) {
      if (this.challanNumber() != null) {
        this.updateDeliveryChallan(
          { ...payload, status: 'OPEN' },
          this.challanNumber(),
        );
      } else {
        this.createDeliveryChallan(payload);
      }
    }
  }

  customSearchFn(term: string, item: any) {
    term = term.toLowerCase();
    return item.code.toLowerCase().includes(term) || item.name.toLowerCase().includes(term);
  }


  createDeliveryChallan(payload: any) {
    this.loading.set(true);
    this.deliveryChallanService.createDeliveryChallan(payload).subscribe(
      (res: any) => {
        this.toastr.success(
          `Delivery Challan is Created Successfully for challan number: ${res?.challanNumber}`,
        );
        this.loading.set(false);
        this.router.navigate([this.ROUTES.TRANSACTIONS.CHALLAN_VIEW]);
      },
      (err: any) => {
        console.log(err?.error?.details);

        if (err?.error?.details && err?.error?.details.length > 0) {
          this.toastr.error(
            err.error.details
              .map((detail: any, index: number) => {
                return detail.description === 'null' ||
                  detail.description === null ||
                  detail.description === '0'
                  ? `${index + 1}) ${detail.description}`
                  : `${index + 1}) ${detail.description}`;
              })
              .join('<br><br>'),
            '',
            {
              enableHtml: true,
              disableTimeOut: true,
            },
          );
          // err.error?.details.forEach((errValue: any) => {
          //   this.toastr.error(errValue.description);
          // });
        } else {
          this.toastr.error('Something went wrong');
        }
        this.loading.set(false);
      },
    );
  }
  updateDeliveryChallan(payload: any, challanNumber: string) {
    this.loading.set(true);

    this.deliveryChallanService
      .updateDeliveryChallan(
        { ...payload, destinationType: this.destinationType },
        challanNumber,
      )
      .subscribe(
        (res: any) => {
          this.toastr.success(
            `Delivery Challan is Updated Successfully for challan number: ${res?.challanNumber}`,
          );
          this.loading.set(false);
          this.router.navigate([this.ROUTES.TRANSACTIONS.CHALLAN_VIEW]);
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

  clearExpectedDate() {
    this.expectedDate.reset();
    this.challanFormGroup.get('expectedDate')?.setValue(null);
  }

  clearFrlrDate() {
    this.frlrDate.reset();
    this.challanFormGroup.get('frlrDate')?.setValue(null);
  }
  validatePostalCode(event: any) {
    const postalCode = event.target.value;
    const pattern = /^[0-9]+$/;
    const isLengthValid = postalCode.length === 6;
    this.isPostalCodeValid =
      postalCode === '' || (pattern.test(postalCode) && isLengthValid);
  }
  enforceTwoDecimals(event: any) {
    const input = event.target;
    if (input.value.includes('.')) {
      const [integer, decimal] = input.value.split('.');
      if (decimal.length > 2) {
        input.value = integer + '.' + decimal.slice(0, 2);
      }
    }
  }
}
