import {
  Component,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ROUTEPATHS } from '../../../../core/constants/routes.constants';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookupTypeService } from '../../../../core/service/lookup-type.service';

@Component({
  selector: 'app-add-edit-lookup-type',
  templateUrl: './add-edit-lookup-type.component.html',
  styleUrl: './add-edit-lookup-type.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, RouterLink, ToastrModule],
})
export class AddEditLookupTypeComponent implements OnInit {
  ROUTES = ROUTEPATHS;
  loading = signal(false);
  lookupForm: FormGroup = new FormGroup({
    type: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    status: new FormControl<'Active' | 'Inactive'>(
      'Active',
      Validators.required
    ),
  });
  ACTION_BY_VALUE = '1';
  lookupTypeId = signal(0);
  private toastr = inject(ToastrService);

  constructor(
    private router: Router,
    private lookupTypeService: LookupTypeService,
    private _Activatedroute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.lookupTypeId.set(
      this._Activatedroute.snapshot.params?.['lookupTypeId'] | 0
    );
    if (this.lookupTypeId() > 0) {
      this.getLookupById(this.lookupTypeId());
    }
  }

  private getLookupById(lookupTypeId: number) {
    this.lookupTypeService
      .getLookupTypeById(lookupTypeId)
      .subscribe((response: any) => {
        this.lookupForm.setValue({
          type: response?.type,
          description: response?.description,
          status: response?.status,
        });
      });
  }

  isFormValid() {
    return this.lookupForm.valid;
  }

  //FUNCTION EXECUTED ON SUBMIT BUTTON CLICK
  onPressSubmit() {
    if (this.lookupTypeId() === 0) {
      const data = {
        type: this.lookupForm.controls['type'].value,
        description: this.lookupForm.controls['description'].value,
        actionBy: this.ACTION_BY_VALUE,
      };
      this.createNewLookup(data);
    } else if (this.lookupTypeId() > 0) {
      const data = {
        ...this.lookupForm.value,
        actionBy: this.ACTION_BY_VALUE,
      };
      this.updateLookupType(data, this.lookupTypeId());
    }
  }

  //CREATE NEW LOOKUP
  private createNewLookup(data: any) {
    this.loading.set(true);
    this.lookupTypeService.createLookupTypes(data).subscribe(
      (response: any) => {
        this.toastr.success('Lookup Type Created Successfully', '', {
          timeOut: 2000,
        });
        this.router.navigate([this.ROUTES.MASTERS.LOOKUP_TYPE.VIEW]);
        this.loading.set(false);
      },
      (error) => {
        this.toastr.error(error.statusText, error.status);
        this.loading.set(false);
      }
    );
  }

  private updateLookupType(data: any, id: number) {
    this.loading.set(true);
    this.lookupTypeService.updateLookupTypes(data, id).subscribe(
      (response: any) => {
        this.toastr.success('Lookup Type Updated Successfully', '', {
          timeOut: 2000,
        });
        this.router.navigate([this.ROUTES.MASTERS.LOOKUP_TYPE.VIEW]);
        this.loading.set(false);
      },
      (error) => {
        this.toastr.error(error.statusText, error.status);
        this.loading.set(false);
      }
    );
  }
}
