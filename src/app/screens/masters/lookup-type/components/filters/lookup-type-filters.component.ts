import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-lookup-type-filters',
  standalone: true,
  imports: [FormsModule, NgSelectModule, CommonModule],
  templateUrl: './lookup-type-filters.component.html',
  styleUrl: './lookup-type-filters.component.scss',
})
export class LookupTypeFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();

  status = signal(undefined);
  type = signal(undefined);

  handleSearch() {
    this.getData.emit({ type: this.type(), status: this.status() });
  }

  onClearFilter() {
    this.status.set(undefined);
    this.type.set(undefined);
    let obj = {
      code: '',
    };
    this.getData.emit(obj);
  }
}
