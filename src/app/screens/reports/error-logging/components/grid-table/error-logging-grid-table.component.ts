import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, signal, ViewChild } from '@angular/core';
import { CommonUtility } from '../../../../../core/utilities/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error-logging-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './error-logging-grid-table.component.html',
  styleUrl: './error-logging-grid-table.component.scss'
})
export class ErrorLoggingGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Output() printEvent = new EventEmitter<any>();
  @Input() filterKeyword!: string;
  @Input() errorLoggingListOrg: any;
  @Input() errorLoggingList: any;
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  constructor() { }

  sortData(field: string) {
    if (this.sortField() === field && this.sortDirection() === 'asc') {
      this.sortDirection.set('desc');
    } else {
      this.sortDirection.set('asc');
    }
    this.sortField.set(field);
    CommonUtility.sortTableData(field, this.sortDirection(), this.errorLoggingList);
  }
}
