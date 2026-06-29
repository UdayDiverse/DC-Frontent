import { environment } from '../../../environments/environment';

const apiPath = environment.apiPath;
const umsURL = environment.umsURL;
const dcURL = environment.dcURL;
const commonURL = environment.commonAPI;

export const APIConstant = {
  basePath: apiPath,
  appSlug: `Delivery Challan`,
  Ums: umsURL,
  Dc: dcURL,
  commonURL: commonURL,
  generateToken: (appId: string) => `api/v1/login/generate-token/${appId}`,
  getLookup: (id: string) => `lookup/${id}`,
  lookups: (offset: number, count: number) =>
    `lookup/search?offset=${offset}&count=${count}`,
  updateLookup: (id: number) => `lookup/update/${id}`,
  createLookup: `lookup/create`,
  createLookupType: `lookup-type/create`,
  updateLookupType: (id: number) => `lookup-type/update/${id}`,
  getLookupsByType: (type: string) => `lookup/type/${type}`,
  lookupTypes: (offset: number, count: number) =>
    `lookup-type/search?offset=${offset}&count=${count}`,
  getLookupTypeById: (id: number) => `lookup-type/${id}`,
  getLookupById: (id: number) => `lookup/${id}`,
  getPlants: (offset: number, count: number) =>
    `plant/search?offset=${offset}&count=${count}`,
  getPlantById: (plantId: number) => `plant/${plantId}`,
  getTransporters: (offset: number, count: number) =>
    `transporter/search?offset=${offset}&count=${count}`,
  getTransporterById: (transporterId: number) => `transporter/${transporterId}`,
  getVendors: (offset: number, count: number) =>
    `vendor/search?offset=${offset}&count=${count}`,
  getVendorById: (vendorId: number) => `vendor/${vendorId}`,
  getCustomers: (offset: number, count: number) =>
    `customer/search?offset=${offset}&count=${count}`,
  getCustomerById: (customerId: number) => `customer/${customerId}`,
  getSubInventories: (offset: number, count: number) =>
    `subinventory/search?offset=${offset}&count=${count}`,
  getSubinventoryById: (subinventoryId: number) =>
    `subinventory/${subinventoryId}`,
  createDeliveryChallan: `deliverychallantxn/create`,
  updateDeliveryChallan: (challanNumber: string) =>
    `commonService/update/${challanNumber}`,
  getChallanByChallanNumber: (challanNumber: string) =>
    `commonService/${challanNumber}`,
  getChallanPrintDetails: (challanNumber: string) =>
    `commonService/challanPrintData/${challanNumber}`,
  getPrintDataByChallanNumber: (challanNumber: string) =>
    `commonService/challanPrintData/${challanNumber}`,
  getAttachments: (challanId: number) => `deliverychallandocument/${challanId}`,
  printEwayBill: (challanNumber: string) =>
    `ewayBill/getEwayBill/${challanNumber}`,
  getDeliveryChallans: (offset: number, count: number) =>
    `deliverychallantxn/search?offset=${offset}&count=${count}`,
  getControlOutgoing: (offset: number, count: number) =>
    `controloutgoing/search?offset=${offset}&count=${count}`,
  updateControlOutgoing: (id: number) => `controloutgoing/update/${id}`,
  dcControlOutgoing: (challanNumber: string) =>
    `controloutgoing/dcupdate/${challanNumber}`,
  bulkStatusUpdate: `commonService/bulk-status-update`,
  deliveryChallanApproval: (challanNumber: string) =>
    `approver/updateApproval/${challanNumber}`,
  createEwaybillManually: (challanNumber: string) =>
    `ewayBill/createEwayBill/${challanNumber}`,
  updateEwaybillManually: (challanNumber: string) =>
    `ewayBill/updateEwayBill/${challanNumber}`,
  extendDueDate: (challanNumber: string) =>
    `deliverychallantxn/update/dueDate/${challanNumber}`,
  updatePlant: (interfaceId: string) => `plant/update/${interfaceId}`,
  getAudits: (challanNumber: string) => `commonservice/audit/${challanNumber}`,
  getGateIns: (challanNumber: string) => `gate-in/${challanNumber}`,
  createGateIn: `gate-in/create`,
  getPlantTypes: `plant/getDistinctPlant`,
  getAgeingReports: (offset: number, count: number) =>
    `ageingReport/search?offset=${offset}&count=${count}`,
  getErrorLoggingReports: (offset: number, count: number) =>
    `errorLoggingReport/search?offset=${offset}&count=${count}`,
  getEmailReports: (offset: number, count: number) =>
    `emailReport/search?offset=${offset}&count=${count}`,
  getUserBlockedFlag: (userId: string) => `commonService/user/${userId}`,
  getfreightOutBoundReports: (offset: number, count: number) =>
    `freightOutboundReport/search?offset=${offset}&count=${count}`,
  getGateOutFilters: `deliverychallantxn/filters-search`,
  generateEwayBillViaApi: `ewayBill/generateEwayBill`,
  cancelEwayBillViaApi: `ewayBill/CancelledEwayBill`,
  getGateOutReports: (offset: number, count: number) =>
    `controloutgoing/search?offset=${offset}&count=${count}`,
  vendorAsTransporter: `vendor/vendorAsTrasnporter`,
};