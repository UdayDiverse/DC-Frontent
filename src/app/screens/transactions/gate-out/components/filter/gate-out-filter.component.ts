import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoggedInUserService } from '../../../../../core/service/user.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDatepickerModule,
  NgbDateStruct,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GateOutService } from '../../../../../core/service/gate-out.service';

@Component({
  selector: 'app-gate-out-filter',
  standalone: true,
  imports: [
    FormsModule,
    NgSelectModule,
    CommonModule,
    NgbDatepickerModule,
    NgbModule,
  ],
  templateUrl: './gate-out-filter.component.html',
  styleUrl: './gate-out-filter.component.scss',
})
export class GateOutFilterComponent implements OnInit {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();
  documentTypeFilters: any[] = [];
  transporterCodeFilters: any[] = [];
  vehicleNumberFilters: any[] = [];
  documentNumberFilters: any[] = [];
  documentType = signal(undefined);
  documentNo = signal(undefined);
  transporterCode = signal(undefined);
  vehicleNumber = signal(undefined);
  status = signal(undefined);
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  plantCodes = signal(this.plantCodesFromUMS);
  toastr = inject(ToastrService);
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();
  fifteenDaysAgo = this.calendar.getPrev(this.todayNgb, 'd', 15);
  fromDate = signal<NgbDate | null>(this.fifteenDaysAgo);
  toDate = signal<NgbDate | null>(this.todayNgb);
  gateOutService = inject(GateOutService);
  ngOnInit() {
    this.handleSearch();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filters']) {
      this.documentNumberFilters = this.filters?.DocumentNo;
      this.documentTypeFilters = this.filters?.DocumentType;
      this.transporterCodeFilters = this.filters?.TransporterCode;
      this.vehicleNumberFilters = this.filters?.VehicleNumber;
    }
  }

  convertNgbToDate(date: NgbDate | null) {
    if (date == null) return;
    const month = Number(date.month) < 10 ? '0' + date.month : date.month;
    const day = Number(date.day) < 10 ? '0' + date.day : date.day;
    return date.year + '-' + month.toString() + '-' + day.toString();
  }

  onDocumentTypeSelection(challanType: any) {
    const payload = {
      challanType: this.documentType(),
      transporterCode: this.transporterCode(),
      vehicleNumber: this.vehicleNumber(),
      challanNumber: this.documentNo(),
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    };

    this.transporterCode.set(undefined);
    this.vehicleNumber.set(undefined);
    this.documentNo.set(undefined);

    this.gateOutService.getGateOutFilters(payload).subscribe((res: any) => {
      this.transporterCodeFilters = res?.filters?.TransporterCode;
      this.vehicleNumberFilters = res?.filters?.VehicleNumber;
      this.documentNumberFilters = res?.filters?.challanNumbers;
    });
  }
  onTransporterCodeSelection(code: any) {
    const payload = {
      challanType: this.documentType(),
      transporterCode: this.transporterCode(),
      vehicleNumber: this.vehicleNumber(),
      challanNumber: this.documentNo(),
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    };

    this.vehicleNumber.set(undefined);
    this.documentNo.set(undefined);

    this.gateOutService.getGateOutFilters(payload).subscribe((res: any) => {
      this.vehicleNumberFilters = res?.filters?.VehicleNumber;
      this.documentNumberFilters = res?.filters?.challanNumbers;
    });
  }
  onVehicleNumberSelection(code: any) {
    const payload = {
      challanType: this.documentType(),
      transporterCode: this.transporterCode(),
      vehicleNumber: this.vehicleNumber(),
      challanNumber: this.documentNo(),
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    };

    this.documentNo.set(undefined);

    this.gateOutService.getGateOutFilters(payload).subscribe((res: any) => {
      this.documentNumberFilters = res?.filters?.challanNumbers;
    });
  }

  isBefore(a: NgbDateStruct, b: NgbDateStruct): boolean {
    return (
      a.year < b.year ||
      (a.year === b.year && a.month < b.month) ||
      (a.year === b.year && a.month === b.month && a.day < b.day)
    );
  }

  onDateChange() {
    const payload = {
      challanType: this.documentType(),
      transporterCode: this.transporterCode(),
      vehicleNumber: this.vehicleNumber(),
      challanNumber: this.documentNo(),
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    };

    this.transporterCode.set(undefined);
    this.vehicleNumber.set(undefined);
    this.documentNo.set(undefined);
    this.documentType.set(undefined);

    this.gateOutService.getGateOutFilters(payload).subscribe((res: any) => {
      this.transporterCodeFilters = res?.filters?.TransporterCode;
      this.vehicleNumberFilters = res?.filters?.VehicleNumber;
      this.documentNumberFilters = res?.filters?.challanNumbers;
      this.documentTypeFilters = res?.filters?.ChallanType;
    });
  }

  convertToNgbDate(dateString: string): any {
    if (dateString) {
      const dateParts = dateString?.split('-');
      return new NgbDate(
        parseInt(dateParts[0], 10),
        parseInt(dateParts[1], 10),
        parseInt(dateParts[2], 10),
      );
    }
  }

  handleSearch() {
    if (
      this.fromDate() &&
      this.toDate() &&
      this.isBefore(
        this.toDate() as NgbDateStruct,
        this.fromDate() as NgbDateStruct,
      )
    ) {
      this.toastr.error("From Date can't be greater than To Date");
      return;
    }

    this.getData.emit({
      documentType: this.documentType(),
      documentNo: this.documentNo(),
      transporterCode: this.transporterCode(),
      vehicleNumber: this.vehicleNumber(),
      status: this.status(),
      plantCode: this.plantCodes(),
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    });
  }

  onClearFilter() {
    this.documentType.set(undefined);
    this.documentNo.set(undefined);
    this.transporterCode.set(undefined);
    this.vehicleNumber.set(undefined);
    this.status.set(undefined);
    this.plantCodes.set(this.plantCodesFromUMS);
    this.fromDate.set(this.fifteenDaysAgo);
    this.toDate.set(this.todayNgb);
    let obj = {
      documentType: '',
      documentNo: '',
      transporterCode: '',
      vehicleNumber: '',
      status: '',
      plantCode: '',
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    };
    this.getData.emit(obj);
  }
  exportData() {
    this.exportEvent.emit();
  }
}
