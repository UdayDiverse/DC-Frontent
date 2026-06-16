import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-vendor-filters',
  standalone: true,
  imports: [FormsModule, NgSelectModule, CommonModule],
  templateUrl: './vendor-filters.component.html',
  styleUrl: './vendor-filters.component.scss',
})
export class VendorFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  vendorCode = signal(undefined);
  vendorName = signal(undefined);
  bpGroup = signal(undefined);
  status = signal(undefined);
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();

  handleSearch() {
    this.getData.emit({
      vendorCode: this.vendorCode(),
      vendorName: this.vendorName(),
      bpGroup: this.bpGroup(),
      status: this.status(),
    });
  }

  onClearFilter() {
    this.vendorCode.set(undefined);
    this.vendorName.set(undefined);
    this.bpGroup.set(undefined);
    this.status.set(undefined);
    let obj = {
      vendorCode: '',
      vendorName: '',
      bpGroup: '',
      status: '',
    };
    this.getData.emit(obj);
  }

  exportData() {
    this.exportEvent.emit();
  }
}
