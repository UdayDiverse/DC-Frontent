import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbDatepickerModule,
  NgbModule,
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { LoggedInUserService } from '../../../../../core/service/user.service';

@Component({
  selector: 'app-freight-outbound-filters',
  standalone: true,
  imports: [
    NgSelectModule,
    CommonModule,
    FormsModule,
    NgbDatepickerModule,
    NgbModule,
  ],
  templateUrl: './freight-outbound-filters.component.html',
  styleUrl: './freight-outbound-filters.component.scss',
})
export class FreightOutboundFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  plantCode = signal(this.plantCodesFromUMS);
  transporterCode = signal(undefined);
  vehicleNumber = signal(undefined);
  vehicleSize = signal(undefined);
  toastr = inject(ToastrService);
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  yesterdayNgb = this.calendar.getPrev(this.todayNgb, 'd', 1);
  fromDate = signal<NgbDate>(this.firstOfMonth ? this.convertToNgbDate(this.firstOfMonth) : this.yesterdayNgb);
  toDate = signal<NgbDate>(this.todayNgb);

  convertNgbToDate(date: NgbDate) {
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
        parseInt(dateParts[2], 10)
      );
    }
  }

  handleSearch() {
    if (
      this.fromDate() &&
      this.toDate() &&
      this.isBefore(this.toDate(), this.fromDate())
    ) {
      this.toastr.error("From Date can't be greater than To Date");
      return;
    }
    this.getData.emit({
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
      plantCode: this.plantCode(),
      transporterCode: this.transporterCode(),
      vehicleNumber: this.vehicleNumber(),
      vehicleSize: this.vehicleSize(),

    });
  }

  onClearFilter() {
    this.fromDate.set(this.firstOfMonth ? this.convertToNgbDate(this.firstOfMonth) : this.yesterdayNgb);
    this.toDate.set(this.todayNgb);
    this.plantCode.set(this.plantCodesFromUMS);
    this.transporterCode.set(undefined);
    this.vehicleNumber.set(undefined);
    this.vehicleSize.set(undefined);
    let obj = {
      fromDate: '',
      toDate: '',
      plantCode: '',
      transporterCode: '',
      vehicleNumber: '',
      vehicleSize: '',
    };
    this.getData.emit(obj);
  }
  exportData() {
    this.exportEvent.emit();
  }
}
