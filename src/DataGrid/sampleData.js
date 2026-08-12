/*
 * Sample data — mirrors the customer-accounts mock used in the
 * CWAN-Exercise Figma file. Status maps to the Status Badge variants:
 * Active → success, Pending → warning, Inactive → neutral, Suspended → error.
 */

/* Column widths are sized so the header (label + sort/filter icon + widest
   density padding) always fits — headers never truncate; only cell values do.
   `priority` drives responsive auto-hiding: 1 never hides; higher numbers
   drop first as the container narrows (Figma: Tablet → prioritized columns). */
export const columns = [
  { key: 'name', label: 'Customer Name', sortable: true, editable: true, width: 158, priority: 1 },
  { key: 'account', label: 'Account #', sortable: true, width: 128, priority: 4 },
  { key: 'type', label: 'Account Type', sortable: true, width: 150, priority: 5 },
  { key: 'status', label: 'Status', badge: true, sortable: false, filter: true, width: 130, priority: 3 },
  { key: 'balance', label: 'Balance', numeric: true, sortable: true, currencyFrom: 'currency', editable: true, width: 130, priority: 2 },
  { key: 'currency', label: 'Currency', sortable: false, width: 102, priority: 8 },
  { key: 'lastActivity', label: 'Last Activity', sortable: true, width: 142, priority: 6 },
  { key: 'country', label: 'Country', sortable: false, filter: true, width: 126, priority: 7 }
];

export const statusVariant = {
  Active: 'success',
  Pending: 'warning',
  Inactive: 'neutral',
  Suspended: 'error'
};

export const data = [
  { id: 'a1', name: 'Acme Corp', account: '1001-4820', type: 'Business Checking', status: 'Active', balance: 245800.5, currency: 'USD', lastActivity: 'Aug 10, 2026', country: 'United States' },
  { id: 'a2', name: 'Olivia Chen', account: '1001-4821', type: 'Personal Savings', status: 'Active', balance: 87340.25, currency: 'USD', lastActivity: 'Aug 09, 2026', country: 'Canada' },
  { id: 'a3', name: 'BrightWave Ltd', account: '1001-4822', type: 'Business Savings', status: 'Active', balance: 512000.0, currency: 'GBP', lastActivity: 'Aug 08, 2026', country: 'United Kingdom' },
  { id: 'a4', name: 'Marcus Johnson', account: '1001-4823', type: 'Personal Checking', status: 'Pending', balance: 3100.0, currency: 'USD', lastActivity: 'Jul 15, 2026', country: 'United States' },
  { id: 'a5', name: 'Zephyr Analytics', account: '1001-4824', type: 'Business Checking', status: 'Inactive', balance: 1890500.0, currency: 'EUR', lastActivity: 'Aug 11, 2026', country: 'Germany' },
  { id: 'a6', name: 'Priya Sharma', account: '1001-4825', type: 'Personal Savings', status: 'Active', balance: 42670.9, currency: 'USD', lastActivity: 'Aug 07, 2026', country: 'United States' },
  { id: 'a7', name: 'NovaEdge Inc', account: '1001-4826', type: 'Money Market', status: 'Active', balance: 2340000.0, currency: 'USD', lastActivity: 'Aug 10, 2026', country: 'United States' },
  { id: 'a8', name: "Liam O'Brien", account: '1001-4827', type: 'Personal Checking', status: 'Suspended', balance: -15980.4, currency: 'EUR', lastActivity: 'Jun 20, 2026', country: 'Ireland' },
  { id: 'a9', name: 'Solaris Group', account: '1001-4828', type: 'Business Savings', status: 'Active', balance: 780250.0, currency: 'CHF', lastActivity: 'Aug 09, 2026', country: 'Switzerland' },
  { id: 'a10', name: 'Amara Diallo', account: '1001-4829', type: 'Personal Savings', status: 'Active', balance: 28455.3, currency: 'USD', lastActivity: 'Aug 05, 2026', country: 'Senegal' },
  { id: 'a11', name: 'TerraVerde SA', account: '1001-4830', type: 'Business Checking', status: 'Active', balance: 3450000.0, currency: 'BRL', lastActivity: 'Aug 11, 2026', country: 'Brazil' },
  { id: 'a12', name: 'Kenji Watanabe', account: '1001-4831', type: 'Personal Checking', status: 'Active', balance: 56120.0, currency: 'JPY', lastActivity: 'Aug 08, 2026', country: 'Japan' }
];
