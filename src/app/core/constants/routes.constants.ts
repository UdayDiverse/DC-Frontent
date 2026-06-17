export const ROUTEPATHS = {
  MASTERS: {
    HOME: 'masters',
    PLANT: {
      VIEW: 'masters/plants',
      EDIT: 'masters/plants/edit',
    },
    TRANSPORTER: 'masters/transporters',
    VENDOR: 'masters/vendors',
    CUSTOMER: 'masters/customers',
    SUBINVENTORY: 'masters/sub-inventories',
    LOOKUP: {
      VIEW: 'masters/lookups',
      CREATE: 'masters/lookup/create',
      EDIT: 'masters/lookup/edit',
    },
    LOOKUP_TYPE: {
      VIEW: 'masters/lookup-types',
      CREATE: 'masters/lookup-type/create',
      EDIT: 'masters/lookup-type/edit',
    },
  },

  TRANSACTIONS: {
    CREATE_CHALLAN: 'transactions/delivery-challan-create',
    EDIT_CHALLAN: 'transactions/delivery-challan-edit',
    CHALLAN_VIEW: 'transactions/delivery-challan-view',
    CHALLAN_APPROVAL: 'transactions/delivery-challan-approval',
    CONTROL_OUTGOING: 'transactions/control-outgoing',
    EWAY_BILL_GENERATION: 'transactions/eway-bill-generation',
    VIEW_CHALLAN: 'transactions/view-challan',
    GATE_OUT: 'transactions/gate-out',
    DUEDATE_EXTENSION: 'transactions/duedate-extension',
    GATE_IN: 'transactions/gate-in',
  },

  REPORTS: {
    AGEING: 'reports/ageing',
    FREIGHT_OUTBOUND: 'reports/freight-outbound',
    ERROR_LOGGING: 'reports/error-logging',
    EMAIL: 'reports/email',
    GATE_OUT: 'reports/gate-out-report'
  }
};
