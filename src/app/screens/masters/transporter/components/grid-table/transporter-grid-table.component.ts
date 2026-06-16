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
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonUtility } from '../../../../../core/utilities/common';
import { ROUTEPATHS } from '../../../../../core/constants/routes.constants';

@Component({
  selector: 'app-transporter-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './transporter-grid-table.component.html',
  styleUrl: './transporter-grid-table.component.scss',
})
export class TransporterGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Input() filterKeyword!: string;
  @Input() transporterOrg: any;
  @Input() transporter: any;
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  ROUTES = ROUTEPATHS;

  constructor() {}

  ngOnInit(): void {}

  emitHeaders() {
    if (!this.table) {
      return;
    }
    const headers: string[] = [];
    const headerCells = this.table.nativeElement.querySelectorAll('thead th');
    headerCells.forEach((cell: any) => {
      if (cell.innerText.trim() !== 'Action') {
        // Exclude "Actions" header
        headers.push(cell.innerText.trim());
      }
    });
    this.exportHeader.emit(headers);
  }

  sortData(field: string) {
    if (this.sortField() === field && this.sortDirection() === 'asc') {
      this.sortDirection.set('desc');
    } else {
      this.sortDirection.set('asc');
    }
    this.sortField.set(field);
    CommonUtility.sortTableData(field, this.sortDirection(), this.transporter);
  }
}
