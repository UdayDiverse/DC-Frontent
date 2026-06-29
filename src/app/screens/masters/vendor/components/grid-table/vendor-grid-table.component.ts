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
import { CommonModule } from '@angular/common';
import { CommonUtility } from '../../../../../core/utilities/common';
import { ROUTEPATHS } from '../../../../../core/constants/routes.constants';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-vendor-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './vendor-grid-table.component.html',
  styleUrl: './vendor-grid-table.component.scss',
})
export class VendorGridTableComponent {
  selectedVendorIds = new Set<number>();
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Input() filterKeyword!: string;
  @Input() vendorListOrg: any;
  @Input() vendorList: any;
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  ROUTES = ROUTEPATHS;

  constructor() { }

  ngOnInit(): void { }

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
    CommonUtility.sortTableData(field, this.sortDirection(), this.vendorList);
  }
  getSelectedIds(): number[] {
    return Array.from(this.selectedVendorIds);
  }

  trackById(index: number, vendor: any): number {
    return vendor.id;
  }

  toggleSelectAll() {
    const selectableVendors = this.vendorList.filter(
      (vendor: any) => vendor.vendorAsTransporter !== 'Y'
    );

    if (this.isAllSelected()) {
      this.selectedVendorIds.clear();
    } else {
      selectableVendors.forEach((vendor: any) =>
        this.selectedVendorIds.add(vendor.id)
      );
    }
  }

  isAllSelected(): boolean {
    const selectableVendors = this.vendorList.filter(
      (vendor: any) => vendor.vendorAsTransporter !== 'Y'
    );
    return (
      selectableVendors.length > 0 &&
      this.selectedVendorIds.size === selectableVendors.length
    );
  }


  toggleSelection(id: number, event: any) {
    const vendor = this.vendorList.find((v: any) => v.id === id);
    if (vendor?.vendorAsTransporter === 'Y') {
      return;
    }

    if (event.target.checked) {
      this.selectedVendorIds.add(id);
    } else {
      this.selectedVendorIds.delete(id);
    }
  }
}