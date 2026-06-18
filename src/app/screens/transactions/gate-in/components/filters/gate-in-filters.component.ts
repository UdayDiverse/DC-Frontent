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
import {
  NgbCalendar,
  NgbDate,
  NgbDatepickerModule,
  NgbDateStruct,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gate-in-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgbDatepickerModule,
    NgbModule,
  ],
  templateUrl: './gate-in-filters.component.html',
  styleUrl: './gate-in-filters.component.scss',
})
export class GateInFiltersComponent implements OnInit {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  challanNumber = signal(undefined);
  toastr = inject(ToastrService);
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();
  fifteenDaysAgo = this.calendar.getPrev(this.todayNgb, 'd', 15);
  fromDate = signal<NgbDate>(this.fifteenDaysAgo);
  toDate = signal<NgbDate>(this.todayNgb);
  ngOnInit() {
    this.handleSearch();
  }

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
      challanNumber: this.challanNumber(),
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    });
  }

  onClearFilter() {
    this.challanNumber.set(undefined);
    this.fromDate.set(this.fifteenDaysAgo);
    this.toDate.set(this.todayNgb);
    let obj = {
      challannumber: '',
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    };
    this.getData.emit(obj);
  }
}
