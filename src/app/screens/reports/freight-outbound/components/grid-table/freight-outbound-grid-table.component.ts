import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonUtility } from '../../../../../core/utilities/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-freight-outbound-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './freight-outbound-grid-table.component.html',
  styleUrl: './freight-outbound-grid-table.component.scss',
})
export class FreightOutboundGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Output() printEvent = new EventEmitter<any>();
  @Input() filterKeyword!: string;
  @Input() freightOutBoundReportListOrg: any;
  @Input() freightOutBoundReportList: any;
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  constructor() {}

  sortData(field: string) {
    if (this.sortField() === field && this.sortDirection() === 'asc') {
      this.sortDirection.set('desc');
    } else {
      this.sortDirection.set('asc');
    }
    this.sortField.set(field);
    CommonUtility.sortTableData(
      field,
      this.sortDirection(),
      this.freightOutBoundReportList
    );
  }
}
