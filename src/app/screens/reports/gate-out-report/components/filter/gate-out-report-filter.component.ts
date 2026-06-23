import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoggedInUserService } from '../../../../../core/service/user.service';
import {
  NgbDatepickerModule,
  NgbModule,
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gate-out-report-filter',
  standalone: true,
  imports: [
    FormsModule,
    NgSelectModule,
    CommonModule,
    NgbDatepickerModule,
    NgbModule,
  ],
  templateUrl: './gate-out-report-filter.component.html',
  styleUrl: './gate-out-report-filter.component.scss',
})
export class GateOutReportFilterComponent implements OnInit {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
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
  fromDate = signal<NgbDate | null>(null);
  toDate = signal<NgbDate | null>(null);

  ngOnInit(): void {
    const today = this.calendar.getToday();
    const fifteenDaysAgo = this.calendar.getPrev(today, 'd', 15);
    this.fromDate.set(fifteenDaysAgo);
    this.toDate.set(today);
    this.handleSearch();
  }

  convertNgbToDate(date: NgbDate | null) {
    if (date == null) return;
    const month = Number(date.month) < 10 ? '0' + date.month : date.month;
    const day = Number(date.day) < 10 ? '0' + date.day : date.day;
    return date.year + '-' + month.toString() + '-' + day.toString();
  }

  isBefore(a: NgbDateStruct, b: NgbDateStruct): boolean {
    return (
      a.year < b.year ||
      (a.year === b.year && a.month < b.month) ||
      (a.year === b.year && a.month === b.month && a.day < b.day)
    );
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
    this.fromDate.set(null);
    this.toDate.set(null);
    let obj = {
      documentType: '',
      documentNo: '',
      transporterCode: '',
      vehicleNumber: '',
      status: '',
      plantCode: '',
      fromDate: '',
      toDate: '',
    };
    this.getData.emit(obj);
  }
}
