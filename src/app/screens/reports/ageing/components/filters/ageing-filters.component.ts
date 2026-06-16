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
  selector: 'app-ageing-filters',
  standalone: true,
  imports: [
    FormsModule,
    NgSelectModule,
    CommonModule,
    NgbDatepickerModule,
    NgbModule,
  ],
  templateUrl: './ageing-filters.component.html',
  styleUrl: './ageing-filters.component.scss',
})
export class AgeingFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  plantCodes = signal(this.plantCodesFromUMS);
  challanStatus = signal(['GATE_IN', 'PARTIAL_GATE_IN', 'GATE_OUT']);
  challanType = signal(undefined);
  branchName = signal(undefined);
  destinationName = signal(undefined);
  itemCategories = signal(undefined);
  departments = signal(undefined);
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
      plantcode: this.plantCodes(),
      challanStatus: this.challanStatus(),
      challanType: this.challanType(),
      branchName: this.branchName(),
      DestinationName: this.destinationName(),
      ItemCategories: this.itemCategories(),
      Departments: this.departments(),
      fromDate: this.convertNgbToDate(this.fromDate()),
      toDate: this.convertNgbToDate(this.toDate()),
    });
  }

  onClearFilter() {
    this.plantCodes.set(this.plantCodesFromUMS);
    this.challanStatus.set(['GATE_IN', 'PARTIAL_GATE_IN', 'GATE_OUT']);
    this.challanType.set(undefined);
    this.branchName.set(undefined);
    this.destinationName.set(undefined);
    this.itemCategories.set(undefined);
    this.departments.set(undefined);
    this.fromDate.set(this.yesterdayNgb);
    this.toDate.set(this.todayNgb);
    let obj = {
      plantCode: '',
      challanStatus: '',
      challanType: '',
      branchName: '',
      destinationName: '',
      itemCategories: '',
      departments: '',
      fromDate: '',
      toDate: '',
    };
    this.getData.emit(obj);
  }
  exportData() {
    this.exportEvent.emit();
  }
}
