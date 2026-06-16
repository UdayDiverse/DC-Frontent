import { Component, ElementRef, EventEmitter, Input, Output, signal, ViewChild } from '@angular/core';
import { CommonUtility } from '../../../../../core/utilities/common';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ageing-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './ageing-grid-table.component.html',
  styleUrl: './ageing-grid-table.component.scss'
})
export class AgeingGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Output() printEvent = new EventEmitter<any>();
  @Input() filterKeyword!: string;
  @Input() ageingListOrg: any;
  @Input() ageingReportsList: any;
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
    CommonUtility.sortTableData(field, this.sortDirection(), this.ageingReportsList);
  }
}