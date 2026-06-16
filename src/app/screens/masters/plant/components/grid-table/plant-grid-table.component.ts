import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonUtility } from '../../../../../core/utilities/common';
import { ROUTEPATHS } from '../../../../../core/constants/routes.constants';
import { LoggedInUserService } from '../../../../../core/service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plant-grid-table',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './plant-grid-table.component.html',
  styleUrl: './plant-grid-table.component.scss',
})
export class PlantGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Input() filterKeyword!: string;
  @Input() plantListOrg: any;
  @Input() plantList: any;
  loadSpinner = signal(true);
  sortField = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  ROUTES = ROUTEPATHS;
  router = inject(Router);

  emitHeaders() {
    if (!this.table) {
      return;
    }
    const headers: string[] = [];
    const headerCells = this.table.nativeElement.querySelectorAll('thead th');
    headerCells.forEach((cell: any) => {
      if (cell.innerText.trim() !== 'Action') {
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
    CommonUtility.sortTableData(field, this.sortDirection(), this.plantList);
  }

  onGoToEditPlant(id: string) {
    this.router.navigate([this.ROUTES.MASTERS.PLANT.EDIT + '/' + id]);
  }
}
