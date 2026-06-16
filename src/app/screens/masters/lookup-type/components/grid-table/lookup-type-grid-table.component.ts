import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonUtility } from '../../../../../core/utilities/common';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ROUTEPATHS as ROUTES } from '../../../../../core/constants/routes.constants';

@Component({
  selector: 'app-lookup-type-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './lookup-type-grid-table.component.html',
  styleUrl: './lookup-type-grid-table.component.scss',
})
export class LookupTypeGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  lookupTypesList = input<any[]>();
  loadSpinner: boolean = true;

  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  constructor(private router: Router) {
    effect(() => {
      if (this.lookupTypesList()) {
        this.emitHeaders();
      }
    });
  }

  ngOnInit(): void {}

  onEditLookupType(id: number) {
    this.router.navigate([ROUTES.MASTERS.LOOKUP_TYPE.EDIT + '/' + id]);
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
      this.lookupTypesList()
    );
  }
}
