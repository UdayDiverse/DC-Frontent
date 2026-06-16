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

@Component({
  selector: 'app-error-logging-filters',
  standalone: true,
  imports: [
    NgSelectModule,
    CommonModule,
    FormsModule,
    NgbDatepickerModule,
    NgbModule,
  ],
  templateUrl: './error-logging-filters.component.html',
  styleUrl: './error-logging-filters.component.scss',
})
export class ErrorLoggingFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();
  messageSource = signal(undefined);
  methodName = signal(undefined);
  responseCode = signal(undefined);
  toastr = inject(ToastrService);
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();
  yesterdayNgb = this.calendar.getPrev(this.todayNgb, 'd', 1);
  firstOfMonth = new Date().toISOString().slice(0, 8) + '01';
  fromDate = signal<NgbDate>(
    this.firstOfMonth
      ? this.convertToNgbDate(this.firstOfMonth)
      : this.yesterdayNgb
  );
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
      messageSource: this.messageSource(),
      methodName: this.methodName(),
      responseCode: this.responseCode(),
    });
  }

  onClearFilter() {
    this.fromDate.set(this.yesterdayNgb);
    this.toDate.set(this.todayNgb);
    this.messageSource.set(undefined);
    this.methodName.set(undefined);
    this.responseCode.set(undefined);
    let obj = {
      fromDate: '',
      toDate: '',
      messageSource: '',
      methodName: '',
      responseCode: '',
    };
    this.getData.emit(obj);
  }
  exportData() {
    this.exportEvent.emit();
  }
}
