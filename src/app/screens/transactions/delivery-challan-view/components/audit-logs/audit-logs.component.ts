import { Component, inject, Input, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DeliveryChallanViewService } from '../../../../../core/service/delivery-challan-view.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss'
})
export class AuditLogsComponent {
  @Input() challanNumber!: string;
  auditDetails = signal<any[]>([]);
  loadSpinner = signal(false);

  activeModal = inject(NgbActiveModal);
  deliveryChallanViewService = inject(DeliveryChallanViewService)


  ngOnInit(): void {
    if (this.challanNumber) {
      this.getAuditLogs(this.challanNumber);
    }
  }

  protected getAuditLogs(challanNumber: string) {
    this.loadSpinner.set(true);
    this.deliveryChallanViewService.getChallanAudits({}, this.challanNumber).subscribe({
      next: (response: any) => {
        this.auditDetails.set(response?.auditDetails),
          this.loadSpinner.set(false);
      },
      error: (err: any) => {
        console.error('Error fetching audit logs:', err);
      }
    })
  }

  close() {
    this.activeModal.dismiss();
  }
}
