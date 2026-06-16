import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoggedInUserService } from '../../../../../core/service/user.service';

@Component({
  selector: 'app-sub-inventory-filters',
  standalone: true,
  imports: [FormsModule, NgSelectModule, CommonModule],
  templateUrl: './sub-inventory-filters.component.html',
  styleUrl: './sub-inventory-filters.component.scss',
})
export class SubInventoryFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  codes = signal(undefined);
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  plantCodes = signal(this.plantCodesFromUMS);
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();

  handleSearch() {
    this.getData.emit({
      subInventoryCode: this.codes(),
      plantCodes:
        this.plantCodes().length === 0
          ? this.plantCodesFromUMS
          : this.plantCodes(),
    });
  }

  onClearFilter() {
    this.codes.set(undefined);
    this.plantCodes.set(this.plantCodesFromUMS);
    let obj = {
      plantCodes: undefined,
      subInventoryGroupCodes: undefined,
    };
    this.getData.emit(obj);
  }

  exportData() {
    this.exportEvent.emit();
  }
}
