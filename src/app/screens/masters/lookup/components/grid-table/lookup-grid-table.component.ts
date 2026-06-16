import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonUtility } from '../../../../../core/utilities/common';
import { ROUTEPATHS } from '../../../../../core/constants/routes.constants';

@Component({
  selector: 'app-lookup-grid-table',
  templateUrl: './lookup-grid-table.component.html',
  styleUrl: './lookup-grid-table.component.scss',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
})
export class LookupGridTableComponent implements OnInit, OnChanges {
  ROUTES = ROUTEPATHS;
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Input() filterKeyword!: string;
  @Input() lookupsListOrg: any;
  @Input() lookupsList: any;
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  constructor(
    private router: Router //  private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  //SORTING DATA FROM FILTER CHANGES
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lookupsList']) {
      this.emitHeaders();
    }
  }

  onGoToEditLookup(id: any) {
    this.router.navigate([this.ROUTES.MASTERS.LOOKUP.EDIT + '/' + id]);
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
    CommonUtility.sortTableData(field, this.sortDirection(), this.lookupsList);
  }
}
