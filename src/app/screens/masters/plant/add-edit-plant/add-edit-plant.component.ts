import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { PlantService } from '../../../../core/service/plant.service';
import { LoggedInUserService } from '../../../../core/service/user.service';
import { LOOKUPS } from '../../../../core/constants/lookups.constant';
import { LookupService } from '../../../../core/service/lookup.service';

@Component({
  selector: 'app-add-edit-plant',
  templateUrl: './add-edit-plant.component.html',
  styleUrl: './add-edit-plant.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, RouterLink],
})
export class AddEditPlantComponent implements OnInit {
  ROUTES = ROUTEPATHS;
  plantForm: FormGroup = new FormGroup({
    plantCode: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    plantName: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    gstNo: new FormControl('', [Validators.required, Validators.minLength(15)]),
    panNo: new FormControl('', Validators.required),
    address1: new FormControl(''),
    address2: new FormControl(''),
    state: new FormControl(''),
    postal: new FormControl(''),
    country: new FormControl(''),
    businessArea: new FormControl(''),
    plantType: new FormControl(''),
    plantZone: new FormControl(''),
  });
  plantData = signal<any[]>([]);
  plantTypes = signal<any[]>([]);
  plantZones = signal<any[]>([]);
  loading = signal(false);
  userService = inject(LoggedInUserService);
  ACTION_BY_VALUE = this.userService.getUserId();
  isItemCategory = false;
  plantId = input<string>();
  plantService = inject(PlantService);
  lookupService = inject(LookupService);
  constructor(private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    // this.getZones();
    if (this.plantId() != null) {
      this.getPlantData(this.plantId());
    }
    this.subscribeToGstinNumber();
  }

  onLookupTypeChange(plantTypeId: any) {
    const selectedLookup = this.plantTypes().find(
      (item: any) => item?.id === plantTypeId
    );

    this.isItemCategory = selectedLookup?.type === 'ItemCategory';
  }

  getPlantData(plantId: any) {
    this.loading.set(true);
    this.plantService.getPlantById(plantId).subscribe(
      (response: any) => {
        this.getZones(response?.plantType);
        this.plantForm.patchValue({
          plantCode: response?.plantCode,
          plantName: response?.plantName,
          gstNo: response?.gstNo,
          panNo: response?.panNo,
          address1: response?.plantAddress1,
          address2: response?.plantAddress2,
          state: response?.state,
          postal: response?.postal,
          country: response?.country,
          businessArea: response?.businessArea,
          plantType: response?.plantType,
          plantZone: response?.plantZone,
        });
        this.loading.set(false);
      },
      (error) => {
        this.toastr.error(error.statusText, error.status);
        this.loading.set(false);
      }
    );
  }

  getZones(plantType: string) {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.plantZones)
      .subscribe((res: any) => {
        const filteredZones = res?.lookUps?.filter(
          (item: any) => item?.code === plantType
        );
        this.plantZones.set(filteredZones);
      });
  }

  subscribeToGstinNumber() {
    this.plantForm.get('gstNo')?.valueChanges.subscribe((gstNo) => {
      if (gstNo.length >= 12) {
        this.plantForm.get('panNo')?.setValue(gstNo?.slice(2, 12));
      } else if (gstNo.length > 2 && gstNo.length < 12) {
        this.plantForm.get('panNo')?.setValue(gstNo?.slice(2));
      } else {
        this.plantForm.get('panNo')?.setValue('');
      }
    });
  }

  onPressSubmit() {
    if (this.plantForm.invalid) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    if (this.plantForm.get('gstNo')?.value.length !== 15) {
      this.toastr.error('Length of GST Number should be exactly 15.');
    }
    const data = this.plantForm.getRawValue();
    this.loading.set(true);

    const plantCode = this.plantForm.get('plantCode')?.value;

    this.plantService.updatePlant(plantCode, data).subscribe(
      (response: any) => {
        this.toastr.success('Plant Updated Successfully');
        this.router.navigate([this.ROUTES.MASTERS.PLANT.VIEW]);
        this.loading.set(false);
      },
      (error) => {
        this.toastr.error(
          error.statusText || 'Error updating plant',
          error.status,
          {
            disableTimeOut: true,
          }
        );
        this.loading.set(false);
      }
    );
  }
}
