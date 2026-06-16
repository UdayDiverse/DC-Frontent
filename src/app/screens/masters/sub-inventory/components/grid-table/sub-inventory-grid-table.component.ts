import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonUtility } from '../../../../../core/utilities/common';
import { ROUTEPATHS } from '../../../../../core/constants/routes.constants';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sub-inventory-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './sub-inventory-grid-table.component.html',
  styleUrl: './sub-inventory-grid-table.component.scss',
})
export class SubInventoryGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Input() filterKeyword!: string;
  @Input() subInventoryListOrg: any;
  @Input() subInventories: any;
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  ROUTES = ROUTEPATHS;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lookupsList']) {
      this.emitHeaders();
    }
  }

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
    CommonUtility.sortTableData(
      field,
      this.sortDirection(),
      this.subInventories
    );
  }
}
