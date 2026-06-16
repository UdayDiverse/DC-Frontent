import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbTooltipModule,
  NgbPopoverModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { GateOutService } from '../../../../../core/service/gate-out.service';
import { LoggedInUserService } from '../../../../../core/service/user.service';
import { CommonUtility } from '../../../../../core/utilities/common';
import { RowSelectionService } from '../../../../../core/service/row-selection.service';

@Component({
  selector: 'app-gate-out-grid-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbPopoverModule,
  ],
  templateUrl: './gate-out-grid-table.component.html',
  styleUrl: './gate-out-grid-table.component.scss',
})
export class GateOutGridTableComponent {
  @ViewChild('table') table!: ElementRef;
  @Output() exportHeader = new EventEmitter<string[]>();
  @Input() filterKeyword: any;
  @Input() outGoingData: any;
  @Input() gateOutList!: any[];
  @Input() activeFilters: any;
  @ViewChild('warningModal') warningModal!: TemplateRef<any>;
  modalService = inject(NgbModal);

  protected loadSpinner = signal(true);
  protected sortField = signal('');
  protected sortDirection = signal<'asc' | 'desc'>('asc');

  protected gateOutService = inject(GateOutService);
  protected toastr = inject(ToastrService);
  protected userService = inject(LoggedInUserService);
  protected rowSelectionService = inject(RowSelectionService);

  private ACTION_BY_VALUE = this.userService.getUserId();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeFilters']) {
      this.rowSelectionService.clearSelections();
      this.rowSelectionService.activeFilters = this.activeFilters;
    }
  }

  protected sortData(field: string) {
    const newDirection =
      this.sortField() === field && this.sortDirection() === 'asc'
        ? 'desc'
        : 'asc';
    this.sortDirection.set(newDirection);
    this.sortField.set(field);
    CommonUtility.sortTableData(field, newDirection, this.gateOutList);
  }

  gateOutAction() {
    const payload = {
      actionBy: this.ACTION_BY_VALUE,
      dcIds: Array.from(this.rowSelectionService.selectedDCIds),
      nerpIds: Array.from(this.rowSelectionService.selectedNERPIds),
      status: 'GATE_OUT',
    };
    return this.gateOutService.bulkStatusUpdate(payload);
  }

  showWarning() {
    // modalRef.result.then(
    //   (result) => {
    //     if (result === 'yes') {
    //       console.log('yes');
    //     }
    //   },
    //   () => console.log('❌ User canceled')
    // );
  }
}
