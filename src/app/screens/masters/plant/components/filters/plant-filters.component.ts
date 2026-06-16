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
  selector: 'app-plant-filters',
  standalone: true,
  imports: [FormsModule, NgSelectModule, CommonModule],
  templateUrl: './plant-filters.component.html',
  styleUrl: './plant-filters.component.scss',
})
export class PlantFiltersComponent {
  @Input() filters: any = [];
  @Output() getData: EventEmitter<any> = new EventEmitter();
  @Output() exportEvent: EventEmitter<any> = new EventEmitter();
  userService = inject(LoggedInUserService);
  plantCodesFromUMS = this.userService.getPlantsForLoggedInUser();
  plantCodes = signal(this.plantCodesFromUMS);
  plantType = signal(undefined);
  businessArea = signal(undefined);

  constructor() {}

  handleSearch() {
    this.getData.emit({
      plantCode:
        this.plantCodes().length === 0
          ? this.plantCodesFromUMS
          : this.plantCodes(),
      plantType: this.plantType(),
      businessArea: this.businessArea(),
    });
  }

  onClearFilter() {
    this.plantCodes.set(this.plantCodesFromUMS);
    this.plantType.set(undefined);
    this.businessArea.set(undefined);
    let obj = {
      plantCode: undefined,
      plantType: undefined,
      businessArea: undefined,
    };
    this.getData.emit(obj);
  }

  exportData() {
    this.exportEvent.emit();
  }
}
