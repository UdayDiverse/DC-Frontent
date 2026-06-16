import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RowSelectionService {
  selectedDCIds = new Set<number>();
  selectedNERPIds = new Set<number>();

  activeFilters?: {
    vehicleNumber?: string;
    fromDate?: string;
    toDate?: string;
  };

  clearSelections() {
    this.selectedDCIds.clear();
    this.selectedNERPIds.clear();
  }

  toggleSelection(id: number, event: Event, documentType: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const targetSet =
      documentType === 'RGP' || documentType === 'NRGP'
        ? this.selectedDCIds
        : this.selectedNERPIds;

    checked ? targetSet.add(id) : targetSet.delete(id);
  }

  selectAllRows(rows: any[]) {
    this.clearSelections();
    rows.forEach((row) => {
      if (
        this.activeFilters?.vehicleNumber &&
        row.vehicleNumber === this.activeFilters.vehicleNumber
      ) {
        const targetSet =
          row.documentType === 'RGP' || row.documentType === 'NRGP'
            ? this.selectedDCIds
            : this.selectedNERPIds;
        targetSet.add(row.interfaceId);
      }
    });
  }

  areAllRowsSelected(rows: any[]): boolean {
    const filteredRows = rows.filter(
      (row) =>
        this.activeFilters?.vehicleNumber &&
        row.vehicleNumber === this.activeFilters.vehicleNumber
    );

    if (filteredRows.length === 0) return false;

    return filteredRows.every((row) => {
      const targetSet =
        row.documentType === 'RGP' || row.documentType === 'NRGP'
          ? this.selectedDCIds
          : this.selectedNERPIds;
      return targetSet.has(row.interfaceId);
    });
  }

  noRowSelected() {
    return this.selectedDCIds.size === 0 && this.selectedNERPIds.size === 0;
  }

  toggleSelectAllFromText(rows: any[]) {
    if (!this.isVehicleFilterApplied()) {
      return;
    }

    if (this.areAllRowsSelected(rows)) {
      this.clearSelections();
    } else {
      this.selectAllRows(rows);
    }
  }

  isRowSelectable(row: any): boolean {
    return true;
  }

  isVehicleFilterApplied(): boolean {
    return !!(
      this.activeFilters?.fromDate &&
      this.activeFilters?.toDate &&
      this.activeFilters?.vehicleNumber
    );
  }
}
