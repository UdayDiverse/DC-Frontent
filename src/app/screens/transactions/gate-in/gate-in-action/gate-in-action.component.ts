import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DeliveryChallanViewService } from '../../../../core/service/delivery-challan-view.service';
import { GateOutService } from '../../../../core/service/gate-out.service';
import { LoggedInUserService } from '../../../../core/service/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { ROUTEPATHS } from '../../../../core/constants/routes.constants';
import { DeliveryChallanService } from '../../../../core/service/delivery-challan.service';

@Component({
  selector: 'app-gate-in-action',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbPopoverModule, RouterLink],
  templateUrl: './gate-in-action.component.html',
  styleUrl: './gate-in-action.component.scss',
})
export class GateInActionComponent {
  ROUTES = ROUTEPATHS;
  challanNumber = input<string>('');
  selectedChallan: any;
  gateInForm!: FormGroup;
  dcItemRows: any[] = [];
  gateInHistoryRows: any[] = [];
  private deliveryChallanViewService = inject(DeliveryChallanViewService);
  private deliveryChallanService = inject(DeliveryChallanService);
  private gateOutService = inject(GateOutService);
  userService = inject(LoggedInUserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  isNothingSelected = true;
  cdr = inject(ChangeDetectorRef);

  get items(): FormArray {
    return this.gateInForm.get('items') as FormArray;
  }

  ngOnInit() {
    this.getChallan();
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

  getChallan() {
    this.deliveryChallanService
      .getChallanByChallanNumber(this.challanNumber())
      .subscribe((res: any) => {
        this.selectedChallan = res;
        this.selectChallan();
      });
  }

  selectChallan() {
    if (!this.challanNumber()) {
      this.toastr.error('something went wrong');
      this.router.navigate([this.ROUTES.TRANSACTIONS.GATE_IN]);
    }

    this.gateOutService.getGateIns(this.challanNumber()).subscribe({
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

  openPopover(popover: NgbPopover) {
    popover.isOpen() ? popover.close() : popover.open();
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

        // route back to gate in screen
        this.router.navigate([this.ROUTES.TRANSACTIONS.GATE_IN]);
      },
      error: (res: any) => this.toastr.error('Error while creating Gate In'),
    });
  }
}
