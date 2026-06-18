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
  NgbCalendar,
  NgbDate,
  NgbDatepickerModule,
  NgbDateStruct,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delivery-challan-view-filters',
  templateUrl: './delivery-challan-view-filter.component.html',
  styleUrl: './delivery-challan-view-filter.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    NgSelectModule,
    CommonModule,
    NgbDatepickerModule,
    NgbModule,
  ],
})
export class ChallanFiltersComponent implements OnInit {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  plantCodes = signal(this.plantCodesFromUMS);
  challanStatus = signal(undefined);
  challanNumber = signal(undefined);
  toastr = inject(ToastrService);
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();
  fifteenDaysAgo = this.calendar.getPrev(this.todayNgb, 'd', 15);
  fromDate = signal<NgbDateStruct>(this.fifteenDaysAgo);
  toDate = signal<NgbDate>(this.todayNgb);
  ngOnInit() {
    this.handleSearch();
  }

  convertNgbToDate(date: NgbDateStruct) {
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
      plantcode: this.plantCodes(),
      challanStatus: this.challanStatus(),
      challanNumber: this.challanNumber(),
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    });
  }

  onClearFilter() {
    this.plantCodes.set(this.plantCodesFromUMS);
    this.challanStatus.set(undefined);
    this.challanNumber.set(undefined);
    this.fromDate.set(this.fifteenDaysAgo);
    this.toDate.set(this.todayNgb);
    let obj = {
      plantCode: '',
      challanStatus: '',
      challannumber: '',
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    };
    this.getData.emit(obj);
  }
  exportData() {
    this.exportEvent.emit();
  }
}
