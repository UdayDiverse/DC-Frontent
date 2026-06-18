import { ROUTEPATHS as ROUTES } from './core/constants/routes.constants';
import { Routes } from '@angular/router';
import { Masters } from './screens/masters/masters';
import { Lookup } from './screens/masters/lookup/lookup';
import { AddEditLookupComponent } from './screens/masters/lookup/add-edit-lookup/add-edit-lookup.component';
import { VendorComponent } from './screens/masters/vendor/vendor.component';
import { TransporterComponent } from './screens/masters/transporter/transporter.component';
import { DeliveryChallanCreationComponent } from './screens/transactions/delivery-challan-creation/delivery-challan-creation.component';
import { CustomerComponent } from './screens/masters/customer/customer.component';
import { SubInventoryComponent } from './screens/masters/sub-inventory/sub-inventory.component';
import { LookupTypeComponent } from './screens/masters/lookup-type/lookup-type.component';
import { AgeingComponent } from './screens/reports/ageing/ageing.component';
import { ErrorLoggingComponent } from './screens/reports/error-logging/error-logging.component';
import { DeliveryChallanViewComponent } from './screens/transactions/delivery-challan-view/delivery-challan-view.component';
import { DeliveryChallanApprovalComponent } from './screens/transactions/delivery-challan-approval/delivery-challan-approval.component';
import { AddEditLookupTypeComponent } from './screens/masters/lookup-type/add-edit-lookup-type/add-edit-lookup-type.component';
import { PlantComponent } from './screens/masters/plant/plant.component';
import { AuthGuard } from './core/guards/auth.guard';

import { ValidateComponent } from './validate/validate.component';
import { ControlOutgoingComponent } from './screens/transactions/control-outgoing/control-outgoing.component';
import { GateOutComponent } from './screens/transactions/gate-out/gate-out.component';
import { EwayBillComponent } from './screens/transactions/eway-bill/eway-bill.component';
import { GenerateEwayBillComponent } from './screens/transactions/eway-bill/generate-eway-bill/generate-eway-bill.component';
import { EditByApproverComponent } from './screens/transactions/delivery-challan-approval/edit-by-approver/edit-by-approver.component';
import { ChallanDocumentComponent } from './layout/challan-document/challan-document.component';
import { AddEditPlantComponent } from './screens/masters/plant/add-edit-plant/add-edit-plant.component';
import { GateInComponent } from './screens/transactions/gate-in/gate-in.component';
import { ViewDeliveryChallanComponent } from './screens/transactions/delivery-challan-view/view-challan/view-challan.component';
import { DueDateExtensionComponent } from './screens/transactions/due-date-extension/due-date-extension.component';
import { ExtendDueDateComponent } from './screens/transactions/due-date-extension/extend-due-date/extend-due-date.component';
import { UserBlockedComponent } from './layout/user-blocked/user-blocked.component';
import { FreightOutboundComponent } from './screens/reports/freight-outbound/freight-outbound.component';
import { EmailReportComponent } from './screens/reports/email/email.component';
import { GateInActionComponent } from './screens/transactions/gate-in/gate-in-action/gate-in-action.component';
import { GateOutReportComponent } from './screens/reports/gate-out-report/gate-out-report.component';

export const routes: Routes = [
  { path: '', redirectTo: ROUTES.MASTERS.HOME, pathMatch: 'full' },
  { path: 'user-blocked', component: UserBlockedComponent },
  {
    path: ROUTES.MASTERS.HOME,
    component: Masters,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.PLANT.VIEW,
    component: PlantComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${ROUTES.MASTERS.PLANT.EDIT}/:plantId`,
    component: AddEditPlantComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.TRANSPORTER,
    component: TransporterComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.LOOKUP.VIEW,
    component: Lookup,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.LOOKUP.CREATE,
    component: AddEditLookupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.VENDOR,
    component: VendorComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.CUSTOMER,
    component: CustomerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.SUBINVENTORY,
    component: SubInventoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.LOOKUP_TYPE.VIEW,
    component: LookupTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.MASTERS.LOOKUP_TYPE.CREATE,
    component: AddEditLookupTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${ROUTES.MASTERS.LOOKUP.EDIT}/:lookupId`,
    component: AddEditLookupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${ROUTES.MASTERS.LOOKUP_TYPE.EDIT}/:lookupTypeId`,
    component: AddEditLookupTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.TRANSACTIONS.CREATE_CHALLAN,
    component: DeliveryChallanCreationComponent,
    canActivate: [AuthGuard],
  },
  // {
  //   path: ROUTES.TRANSACTIONS.CREATE_CHALLAN,
  //   component: DeliveryChallanCreateComponent,
  //   canActivate: [AuthGuard],
  // },
  {
    path: `${ROUTES.TRANSACTIONS.EDIT_CHALLAN}/:challanNumber`,
    component: DeliveryChallanCreationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.REPORTS.AGEING,
    component: AgeingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.REPORTS.FREIGHT_OUTBOUND,
    component: FreightOutboundComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.REPORTS.ERROR_LOGGING,
    component: ErrorLoggingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.REPORTS.EMAIL,
    component: EmailReportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.REPORTS.GATE_OUT_REPORT,
    component: GateOutReportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.TRANSACTIONS.CHALLAN_VIEW,
    component: DeliveryChallanViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.TRANSACTIONS.CHALLAN_APPROVAL,
    component: DeliveryChallanApprovalComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${ROUTES.TRANSACTIONS.CHALLAN_APPROVAL}/:challanNumber`,
    component: EditByApproverComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.TRANSACTIONS.CONTROL_OUTGOING,
    component: ControlOutgoingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.TRANSACTIONS.GATE_OUT,
    component: GateOutComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.TRANSACTIONS.EWAY_BILL_GENERATION,
    component: EwayBillComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${ROUTES.TRANSACTIONS.EWAY_BILL_GENERATION}/:challanNumber`,
    component: GenerateEwayBillComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.TRANSACTIONS.DUEDATE_EXTENSION,
    component: DueDateExtensionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${ROUTES.TRANSACTIONS.DUEDATE_EXTENSION}/:challanNumber`,
    component: ExtendDueDateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${ROUTES.TRANSACTIONS.VIEW_CHALLAN}/:challanNumber`,
    component: ViewDeliveryChallanComponent,
    canActivate: [AuthGuard],
  },
  { path: 'validate', component: ValidateComponent },
  {
    path: `${ROUTES.TRANSACTIONS.GATE_IN}/:challanNumber`,
    component: GateInActionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ROUTES.TRANSACTIONS.GATE_IN,
    component: GateInComponent,
    canActivate: [AuthGuard],
  },
];
