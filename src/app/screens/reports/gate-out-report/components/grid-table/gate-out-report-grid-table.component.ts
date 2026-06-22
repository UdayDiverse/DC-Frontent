import { CommonModule, DatePipe } from '@angular/common';
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
import { ToastrService } from 'ngx-toastr';
import { LoggedInUserService } from '../../../../../core/service/user.service';

@Component({
  selector: 'app-gate-out-report-grid-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbDatepickerModule,
  ],
  templateUrl: './gate-out-report-grid-table.component.html',
  styleUrl: './gate-out-report-grid-table.component.scss',
})
export class GateOutReportGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Output() refreshControlList = new EventEmitter<void>();
  @Input() filterKeyword: any;
  @Input() outGoingData: any;
  @Input() gateOutReportList: any[] = [];
  @Input() activeFilters: any;
  protected loadSpinner = signal(false);
  protected sortField = signal('');
  protected sortDirection = signal<'asc' | 'desc'>('asc');
  protected editedRows = new Set<number>();
  calendar = inject(NgbCalendar);
  todayNgb = this.calendar.getToday();
  protected toastr = inject(ToastrService);
  protected userService = inject(LoggedInUserService);

  private ACTION_BY_VALUE = this.userService.getUserId();
  protected today = new Date().toISOString().split('T')[0];
  datePipe = inject(DatePipe);

  ngOnInit() {

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

  protected sortData(field: string) {
    const newDirection =
      this.sortField() === field && this.sortDirection() === 'asc'
        ? 'desc'
        : 'asc';
    this.sortDirection.set(newDirection);
    this.sortField.set(field);
    CommonUtility.sortTableData(field, newDirection, this.gateOutReportList);
  }
}
