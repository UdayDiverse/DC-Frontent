import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-customer-filters',
  standalone: true,
  imports: [FormsModule, NgSelectModule, CommonModule],
  templateUrl: './customer-filters.component.html',
  styleUrl: './customer-filters.component.scss',
})
export class CustomerFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();
  customerCode = signal(undefined);
  customerName = signal(undefined);
  businessArea = signal(undefined);
  status = signal(undefined);

  handleSearch() {
    this.getData.emit({
      customerCode: this.customerCode(),
      customerName: this.customerName(),
      auCode: this.businessArea(),
      status: this.status(),
    });
  }

  onClearFilter() {
    this.customerCode.set(undefined);
    this.customerName.set(undefined);
    this.businessArea.set(undefined);
    this.status.set(undefined);
    let obj = {
      customerCode: '',
      customerName: '',
      auCode: '',
      status: '',
    };
    this.getData.emit(obj);
  }

  exportData() {
    this.exportEvent.emit();
  }
}
