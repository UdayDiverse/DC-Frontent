import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  Input,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookupService } from '../../../../../core/service/lookup.service';
// import { LookupService } from '../../../../../core/service/lookup.service';

@Component({
  selector: 'app-lookup-filters',
  templateUrl: './lookup-filter.component.html',
  styleUrl: './lookup-filter.component.scss',
  standalone: true,
  imports: [FormsModule, NgSelectModule, CommonModule],
})
export class LookupFiltersComponent {
  @Input() filters: any;
  filters1: any = { LookUpType: [{ id: 1, name: 'test' }] };
  @Output() getData: EventEmitter<any> = new EventEmitter();
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();
  code = signal(undefined);
  type = signal(undefined);
  status = signal(undefined);
  codes = signal<any[]>([]);

  constructor(private lookupService: LookupService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filters']) {
      this.codes.set(this.filters?.Code);
    }
  }

  handleSearch() {
    this.getData.emit({
      code: this.code(),
      lookupType: this.type(),
      status: this.status(),
    });
  }

  onClearFilter() {
    this.code.set(undefined);
    this.type.set(undefined);
    this.status.set(undefined);
    let obj = {
      code: '',
      lookupType: '',
      status: '',
    };
    this.getData.emit(obj);
  }

  selectLookupCodes(event: any) {
    this.lookupService.getLookupSearchByType(event).subscribe((res: any) => {
      const filteredCodes = res?.lookUps.map((item: any) => item?.code);
      this.codes.set(filteredCodes);
    });
  }

  exportData() {
    this.exportEvent.emit();
  }
}
