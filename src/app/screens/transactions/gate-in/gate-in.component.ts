import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { GateInFiltersComponent } from './components/filters/gate-in-filters.component';
import { DeliveryChallanViewService } from '../../../core/service/delivery-challan-view.service';
import { LoggedInUserService } from '../../../core/service/user.service';
import { GateOutService } from '../../../core/service/gate-out.service';
import { Router } from '@angular/router';
import { ROUTEPATHS as ROUTES } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-gate-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    GateInFiltersComponent,
  ],
  templateUrl: './gate-in.component.html',
  styleUrls: ['./gate-in.component.scss'],
})
export class GateInComponent {
  challansList = signal<any[]>([]);
  filters = signal<any[]>([]);
  loading = signal(false);
  count = signal(10);
  appliedFilters = signal<any[]>([]);
  selectedChallan: any;
  gateInForm!: FormGroup;
  dcItemRows: any[] = [];
  gateInHistoryRows: any[] = [];

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private deliveryChallanViewService = inject(DeliveryChallanViewService);
  private gateOutService = inject(GateOutService);
  userService = inject(LoggedInUserService);
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  today = new Date().toISOString().split('T')[0];
  cdr = inject(ChangeDetectorRef);
  isNothingSelected = true;
  private router = inject(Router);

  get items(): FormArray {
    return this.gateInForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.getDeliveryChallansData();
  }

  private buildItemForm(item: any): FormGroup {
    return this.fb.group({
      dcItemId: [item.dcItemId || item.id],
      hsnCode: [item.hsnCode || ''],
      descriptionModelNumber: [item.descriptionModelNumber || ''],
      uom: [item.uom || ''],
      quantity: [item.quantity || 0],
      recievedQty: [item.recievedQty || 0],
      remainingQty: [item.quantity - item.recievedQty || 0],
      recivedQuantity: [
        0,
        [
          Validators.required,
          (control: any) => {
            const remaining = control.parent?.get('remainingQty')?.value;
            return control.value > remaining ? { exceedRemaining: true } : null;
          },
        ],
      ],
      remarks: [item.remarks || ''],
    });
  }

  openGateInScreen(challan: any) {
    this.selectedChallan = challan;
    const challanNumber = challan.challanNumber || challan.challanNo;
    if (!challanNumber) return;

    this.router.navigate([`${ROUTES.TRANSACTIONS.GATE_IN}/${challanNumber}`]);
  }

  subscribeToReceivingQty(fg: FormGroup) {
    fg.get('recivedQuantity')?.valueChanges?.subscribe((qty: any) => {
      let totalReceivingQty = 0;
      for (let i = 0; i < this.items.length; i++) {
        console.log(this.items.at(i)?.get('recivedQuantity')?.value);
        const rcvdQty = this.items.at(i)?.get('recivedQuantity')?.value;
        if (rcvdQty) {
          totalReceivingQty += rcvdQty;
        }
      }

      if (totalReceivingQty === 0) {
        this.isNothingSelected = true;
      } else {
        this.isNothingSelected = false;
      }
    });
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
      fromDate: filters?.fromDate || this.today,
      toDate: filters?.toDate || this.getTommorrowDate(),
      challanType: 'RGP',
      challanNumber: filters?.challanNumber || '',
      status: ['PARTIAL_GATE_IN', 'GATE_OUT'],
    };

    this.loading.set(true);
    this.deliveryChallanViewService
      .getDeliveryChallans(payload, offset, count)
      .subscribe({
        next: (response: any) => {
          const filteredChallans = (response.deliveryChallans || []).filter(
            (c: any) => ['PARTIAL_GATE_IN', 'GATE_OUT'].includes(c.status)
          );
          this.challansList.set(filteredChallans);
          this.filters.set(response.filters);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  selectChallan(challan: any) {
    this.selectedChallan = challan;
    const challanNumber = challan.challanNumber || challan.challanNo;
    if (!challanNumber) return;

    this.gateOutService.getGateIns(challanNumber).subscribe({
      next: (res: any) => {
        const itemsData = (res.dcItemDetails || []).map((dcItem: any) => {
          const gateIn = res.gateInItemsDetails?.find(
            (g: any) => g.dcItemId === dcItem.id
          );
          return {
            dcItemId: dcItem?.id,
            hsnCode: dcItem?.hsnCode,
            descriptionModelNumber: dcItem?.descriptionModelNumber,
            uom: dcItem?.uom,
            quantity: dcItem?.quantity,
            recievedQty: dcItem?.recievedQuantity,
            remainingQty: dcItem?.quantity - dcItem?.recivedQuantity,
            recivedQuantity: gateIn?.recivedQuantity || '',
            remarks: gateIn?.remarks || '',
          };
        });

        this.gateInForm = this.fb.group({
          items: this.fb.array(
            itemsData.map((item: any) => {
              const fg = this.buildItemForm(item);
              this.subscribeToReceivingQty(fg);
              return fg;
            })
          ),
        });

        console.log(this.gateInForm.value);

        this.dcItemRows = res?.dcItemDetails;
        this.gateInHistoryRows = this.dcItemRows.flatMap((dcItem) => {
          return dcItem?.gateInItemsDetails?.map((gateInItem: any) => {
            return {
              ...gateInItem,
              hsnCode: dcItem?.hsnCode,
              modelNumber: dcItem?.descriptionModelNumber,
            };
          });
        });

        this.selectedChallan.receivedHistory = (
          res.gateInItemsDetails || []
        ).map((g: any) => {
          const dcItem = res.dcItemDetails.find(
            (d: any) => d.id === g.dcItemId
          );
          return {
            hsnCode: dcItem?.hsnCode || '',
            description: dcItem?.descriptionModelNumber || '',
            gateInDate: dcItem?.gateInDate || '',
            receivingQty: g.recivedQuantity,
          };
        });

        this.cdr.detectChanges();
      },
    });
  }

  submitRemark(index: number, popover: NgbPopover) {
    this.toastr.success(
      'Remarks updated locally! It will be saved when you click Save.'
    );
    popover.close();
  }

  sumbitGateIn() {
    if (!this.selectedChallan || !this.gateInForm.valid) return;

    const gateInItems = this.gateInForm.value.items?.map((item: any) => {
      return {
        dcItemId: item?.dcItemId,
        recivedQuantity: item?.recivedQuantity,
        remarks: item?.remarks,
      };
    });

    const payload = {
      challanNumber:
        this.selectedChallan.challanNumber || this.selectedChallan.challanNo,
      gateInItemDetails: gateInItems,
      actionBy: this.userService.getUserId(),
    };

    this.gateOutService.createGateIn(payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Gate In created successfully!');
        this.selectedChallan = null;
        this.gateInForm.reset();
        this.getDeliveryChallansData();
      },
      error: (res: any) => this.toastr.error('Error while creating Gate In'),
    });
  }

  openPopover(popover: NgbPopover) {
    popover.isOpen() ? popover.close() : popover.open();
  }

  getData(filters: any) {
    this.selectedChallan = null;
    this.gateInForm = undefined as any;
    this.appliedFilters.set(filters);
    this.getDeliveryChallansData(filters);
  }
}
