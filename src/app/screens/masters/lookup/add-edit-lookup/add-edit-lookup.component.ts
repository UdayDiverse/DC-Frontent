import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ROUTEPATHS } from '../../../../core/constants/routes.constants';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookupService } from '../../../../core/service/lookup.service';
import { LookupTypeService } from '../../../../core/service/lookup-type.service';
import { LoggedInUserService } from '../../../../core/service/user.service';
import { PlantService } from '../../../../core/service/plant.service';

@Component({
  selector: 'app-add-edit-lookup',
  templateUrl: './add-edit-lookup.component.html',
  styleUrl: './add-edit-lookup.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, RouterLink],
})
export class AddEditLookupComponent implements OnInit {
  ROUTES = ROUTEPATHS;
  userService = inject(LoggedInUserService);
  ACTION_BY_VALUE = this.userService.getUserId();
  lookupForm: FormGroup = new FormGroup({
    typeId: new FormControl('', Validators.required),
    code: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    actionBy: new FormControl(this.ACTION_BY_VALUE, Validators.required),
    status: new FormControl('Active', Validators.required),
    attribute13: new FormControl<number>(0, Validators.required),
  });
  lookupData = signal<any[]>([]);
  lookupId = signal(0);
  lookupTypes = signal<any[]>([]);
  loading = signal(false);
  isItemCategory = false;
  isPlantZone = false;
  plantTypes = [];

  constructor(
    private router: Router,
    private lookupService: LookupService,
    private lookupTypeService: LookupTypeService,
    private plantService: PlantService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _Activatedroute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.lookupId.set(this._Activatedroute.snapshot.params['lookupId'] | 0);
    this.getLookupTypes();
    this.getPlantTypes();
    if (this.lookupId() > 0) {
      this.getLookupData(this.lookupId());
    }
  }

  onLookupTypeChange(lookupTypeId: any) {
    const selectedLookup = this.lookupTypes().find(
      (item: any) => item?.id === lookupTypeId
    );

    this.isItemCategory = selectedLookup?.type === 'Item_Category';
    this.isPlantZone = selectedLookup?.type === 'Plant_Zone';
  }

  //TO GET LOOKUP-TYPE DATA
  getLookupTypes() {
    const data = {};
    this.loading.set(true);
    this.lookupTypeService.getLookupsTypes(data).subscribe(
      (response: any) => {
        this.lookupTypes.set(response?.lookUpTypes);
        this.loading.set(false);
      },
      (error: any) => {
        this.toastr.error(error.statusText, error.status);
        this.loading.set(false);
      }
    );
  }

  getPlantTypes() {
    this.plantService.getPlantTypes().subscribe((res: any) => {
      this.plantTypes = res?.plantTypes;
    });
  }

  allowNumeric(event: KeyboardEvent) {
    const pattern = /^[0-9]$/; // only digits 0–9
    const inputChar = String.fromCharCode(event.keyCode || event.which);

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // block non-numeric
    }
  }

  //TO GET SELECTED LOOKUP DATA
  getLookupData(lookupId: number) {
    this.loading.set(true);
    this.lookupService.getLookupById(lookupId).subscribe(
      (response: any) => {
        this.lookupForm.patchValue({
          typeId: response?.lookUpType?.id,
          code: response?.code,
          value: response?.value,
          description: response?.description,
          status: response?.status,
          attribute1: response?.attribute1,
          attribute2: response?.attribute2,
          attribute13: response?.attribute13 || 0,
          attribute4: response?.attribute4,
        });

        if (response?.lookUpType?.code === 'Item_Category') {
          this.isItemCategory = true;
        }

        console.log(response?.lookUpType?.code);

        if (response?.lookUpType?.code === 'Plant_Zone') {
          this.isPlantZone = true;
        }

        this.loading.set(false);
      },
      (error) => {
        this.toastr.error(error.statusText, error.status);
        this.loading.set(false);
      }
    );
  }

  //FUNCTION EXECUTED ON SUBMIT BUTTON CLICK
  onPressSubmit() {
    const data = this.lookupForm.value;
    if (this.lookupId() > 0) {
      this.updateLookup(data);
    } else if (this.lookupId() === 0) {
      this.createNewLookup(data);
    }
  }

  //UPDATING LOOKUP DATA
  updateLookup(data: any) {
    this.loading.set(true);
    this.lookupService.updateLookup(this.lookupId(), data).subscribe(
      (response: any) => {
        this.toastr.success('Lookup Updated Successfully', '', {
          timeOut: 5000,
        });
        this.router.navigate([this.ROUTES.MASTERS.LOOKUP.VIEW]);
        this.loading.set(false);
      },
      (error) => {
        if (error?.error?.responseCode === '400') {
          this.toastr.error(error?.error?.details[0]?.description);
        } else {
          this.toastr.error(error.statusText, error.status, {
            disableTimeOut: true,
          });
        }
        this.loading.set(false);
      }
    );
  }

  //CREATE NEW LOOKUP
  createNewLookup(data: any) {
    this.loading.set(true);
    this.lookupService.createLookup(data).subscribe(
      (response: any) => {
        this.toastr.success('Lookup Created Successfully', '', {
          timeOut: 5000,
        });
        this.router.navigate([this.ROUTES.MASTERS.LOOKUP.VIEW]);
        this.loading.set(false);
      },
      (error) => {
        if (error?.error?.responseCode === '400') {
          this.toastr.error(error?.error?.details[0]?.description);
        } else {
          this.toastr.error(error.statusText, error.status);
        }
        this.loading.set(false);
      }
    );
  }
}
