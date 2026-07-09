import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbCalendar,
  NgbDate,
  NgbDatepickerModule,
  NgbDateStruct,
  NgbPopover,
  NgbPopoverModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonUtility } from '../../../../../core/utilities/common';
import { GateOutService } from '../../../../../core/service/gate-out.service';
import { ToastrService } from 'ngx-toastr';
import { LoggedInUserService } from '../../../../../core/service/user.service';
import { DeliveryChallanService } from '../../../../../core/service/delivery-challan.service';
import { TransporterService } from '../../../../../core/service/transporter.service';
import { LookupService } from '../../../../../core/service/lookup.service';
import { LOOKUPS } from '../../../../../core/constants/lookups.constant';
import { RowSelectionService } from '../../../../../core/service/row-selection.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-control-outgoing-grid-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbDatepickerModule,
  ],
  templateUrl: './control-outgoing-grid-table.component.html',
  styleUrl: './control-outgoing-grid-table.component.scss',
})
export class ControlOutgoingGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Output() refreshControlList = new EventEmitter<void>();
  @Input() filterKeyword: any;
  @Input() outGoingData: any;
  @Input() controlOutgoingList: any[] = [];
  @Input() activeFilters: any;

  protected editableArray: any[] = [];
  protected loadSpinner = signal(false);
  transporters: any[] = [];
  transporterService = inject(TransporterService);
  lookupService = inject(LookupService);
  vehicleSizes: any[] = [];
  protected sortField = signal('');
  protected sortDirection = signal<'asc' | 'desc'>('asc');
  protected editedRows = new Set<number>();
  selectedDCIds = new Set<number>();
  selectedNERPIds = new Set<number>();
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();

  protected controlOutgoingService = inject(GateOutService);
  protected toastr = inject(ToastrService);
  protected userService = inject(LoggedInUserService);
  protected deliveryChallanService = inject(DeliveryChallanService);
  protected rowSelectionService = inject(RowSelectionService);

  private ACTION_BY_VALUE = this.userService.getUserId();
  protected today = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.getTransporters();
    this.getVehicleSizes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['controlOutgoingList'] && this.controlOutgoingList) {
      this.editableArray = this.controlOutgoingList.map((item) => ({ ...item }));
      this.patchTransporterNames();
    }
    if (changes['activeFilters']) {
      this.rowSelectionService.clearSelections();
      this.rowSelectionService.activeFilters = this.activeFilters;
    }
  }

  private patchTransporterNames() {
    if (!this.transporters?.length || !this.editableArray?.length) return;

    this.editableArray.forEach((item, index) => {
      if (!item.transporterName && item.transporterCode && item.documentType === "SAL") {
        const transporter = this.transporters.find(
          (t) => t.code === item.transporterCode
        );
        if (transporter) {
          item.transporterName = transporter.name;
          this.saveRow(index, false);
        }
      }
    });
  }

  allowAlphaNumeric(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9]$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  dateTimeSplit(date: any) {
    let res = date.split('T');
    return res[0];
  }

  private getVehicleSizes() {
    this.lookupService
      .getLookupSearchByType(LOOKUPS.vehicleSizes)
      .subscribe((res: any) => {
        this.vehicleSizes = res?.lookUps;
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

  convertNgbToDate(date: NgbDate) {
    const month = Number(date.month) < 10 ? '0' + date.month : date.month;
    const day = Number(date.day) < 10 ? '0' + date.day : date.day;
    return date.year + '-' + month.toString() + '-' + day.toString();
  }

  onTransporterTypeChange(i: number) {
    this.editableArray[i].transporterCode = '';
    this.editableArray[i].transporterName = '';
    this.editableArray[i].vehicleNumber = '';
    this.editableArray[i].vehicleSize = '';
    this.editableArray[i].frlrNumber = '';
    this.editableArray[i].frlrDate = null;
    this.editableArray[i].controlOutgoingRemarks = null;
  }

  onTransporterCodeChange(transporter: any, i: number) {
    this.editableArray[i].transporterName = transporter?.name;
    this.editableArray[i].transporterCode = transporter?.code;
  }

  private getTransporters() {
    this.transporterService.getTransporters({}, 0, 0).subscribe((res: any) => {
      this.transporters = res?.transporters || [];
      this.patchTransporterNames();
    });
  }

  protected hasDataChanged(index: number): boolean {
    const original = { ...this.controlOutgoingList[index] };
    const edited = { ...this.editableArray[index] };
    if (original.controlOutgoingRemarks === null && edited.controlOutgoingRemarks === '') {
      edited.controlOutgoingRemarks = null;
    }
    return JSON.stringify(original) !== JSON.stringify(edited);
  }

  protected onFieldEdit(controlOutGoing: any) {
    this.editedRows.add(controlOutGoing.id);
  }

  protected saveRow(index: number, showMessage: boolean) {
    const row = this.editableArray[index];
    // if (!row?.transporterCode || !row?.transporterName) {
    //   this.toastr.error('Transporter Code and Transporter Name can not be empty');
    //   return;
    // }

    // if (
    //   row?.transporterType === 'Registered' &&
    //   (!row?.transporterName || !row?.vehicleNumber)
    // ) {
    //   this.toastr.error('Transporter Details & Vehicle No are required for Registered Transporter');
    //   return;
    // }
    const payload: any = {
      frlrDate: row?.frlrDate ? this.convertNgbToDate(row?.frlrDate) : null,
      frlrNumber: row?.frlrNumber,
      transportaionsDetails: '',
      transporterCode: row?.transporterCode,
      transporterType: row?.transporterType,
      transporterName: row?.transporterName,
      vehicleNumber: row?.vehicleNumber ? row.vehicleNumber.toUpperCase() : null,
      vehicleSize: row?.vehicleSize,
      controlOutgoingRemarks: row?.controlOutgoingRemarks,
      actionBy: this.userService.getUserId(),
    };

    this.editedRows.clear();
    this.loadSpinner.set(true);
    const request$ =
      row.documentType === 'RGP' || row.documentType === 'NRGP'
        ? this.controlOutgoingService.dcControlOutgoing(row.documentNo, payload)
        : this.controlOutgoingService.updateControlOutgoing(row.interfaceId, payload);

    request$
      .pipe(finalize(() => this.loadSpinner.set(false)))
      .subscribe({
        next: (res: any) => {
          if (row.documentType === 'RGP' || row.documentType === 'NRGP') {
            this.toastr.success(
              `Transportation details updated successfully for challan number: ${res?.challanNumber}`
            );
          } else if (showMessage) {
            this.toastr.success(
              `Transportation details updated successfully for document number: ${res?.documentNumber}`
            );
          }
          this.loadSpinner.set(false);
          this.refreshControlList.emit();
        },
        error: (err: any) => {
          if (err?.error?.details?.length > 0) {
            err.error.details.forEach((errValue: any) => {
              this.toastr.error(errValue.description);
            });
          } else {
            this.toastr.error('Something went wrong');
          }
        },
      });
  }

  private formatDate(dateStr: string) {
    // If date is already in yyyy-MM-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // If date is in ISO format with time, extract yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      return dateStr.split('T')[0];
    }

    // If it's in neither format, try to parse it and format properly
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Return original if nothing works
    return dateStr;
  }

  protected sortData(field: string) {
    const newDirection =
      this.sortField() === field && this.sortDirection() === 'asc'
        ? 'desc'
        : 'asc';
    this.sortDirection.set(newDirection);
    this.sortField.set(field);
    CommonUtility.sortTableData(field, newDirection, this.controlOutgoingList);
  }

  controlOutgoingAction() {
    const payload = {
      actionBy: this.ACTION_BY_VALUE,
      dcIds: Array.from(this.rowSelectionService.selectedDCIds),
      nerpIds: Array.from(this.rowSelectionService.selectedNERPIds),
      status: 'CONTROL_OUTGOING',
    };

    return this.controlOutgoingService.bulkStatusUpdate(payload);
  }

  protected openPopover(popover: NgbPopover) {
    popover.open();
  }

  protected closePopover(popover: NgbPopover) {
    popover.close();
  }
  public hasAnyRowChanged(): boolean {
    return this.editableArray?.some((_, index) => this.hasDataChanged(index));
  }
}
