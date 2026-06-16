import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-transporter-filters',
  standalone: true,
  imports: [FormsModule, NgSelectModule, CommonModule],
  templateUrl: './transporter-filters.component.html',
  styleUrl: './transporter-filters.component.scss',
})
export class TransporterFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  transporterCode = signal<any>(undefined);
  transporterName = signal(undefined);
  bpGroup = signal(undefined);
  status = signal(undefined);
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();

  constructor() {}

  handleSearch() {
    this.getData.emit({
      bpGroup: this.bpGroup(),
      transporterCode: this.transporterCode(),
      transporterName: this.transporterName(),
      status: this.status(),
    });
  }

  onClearFilter() {
    this.transporterCode.set(undefined);
    this.transporterName.set(undefined);
    this.bpGroup.set(undefined);
    this.status.set(undefined);
    let obj = {
      transporterCode: '',
      transporterName: '',
      bpGroup: '',
      status: '',
    };
    this.getData.emit(obj);
  }

  exportData() {
    this.exportEvent.emit();
  }
}
