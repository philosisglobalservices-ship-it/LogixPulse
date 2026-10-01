import { 
  Company, 
  Branch, 
  Warehouse, 
  User, 
  Product, 
  InventoryItemStock, 
  InboundReceipt, 
  PutawayTask, 
  OutboundOrder, 
  PickWave, 
  DispatchShipment, 
  ReturnOrder, 
  StockAdjustmentRequest, 
  AuditLogEntry, 
  SubscriptionPlan 
} from '../types';
import { computeBlockHashSync } from '../utils/crypto';

export const INITIAL_COMPANY: Company = {
  id: 'comp-01',
  name: 'Eko Integrated Logistics Nigeria Ltd',
  code: 'EKO-LOG-NG',
  taxId: 'NG-TIN-8940218-WOS',
  currency: 'NGN',
  createdAt: '2025-01-15T08:00:00Z',
  subscriptionPlanId: 'growth',
  subscriptionStatus: 'active',
  maxWarehouses: 3,
  maxUsers: 20
};

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-los',
    companyId: 'comp-01',
    name: 'Lagos Commercial Gateway Hub',
    code: 'BR-LOS-NG',
    city: 'Ikeja, Lagos State',
    country: 'Nigeria',
    address: 'Plot 14, Commercial Avenue, Ikeja Industrial Estate, Lagos State',
    managerName: 'Engr. Babatunde Sanusi',
    phone: '+234 1 270 4800'
  },
  {
    id: 'br-abj',
    companyId: 'comp-01',
    name: 'Abuja Federal Capital Logistics Center',
    code: 'BR-ABJ-NG',
    city: 'Idu Industrial Zone, Abuja FCT',
    country: 'Nigeria',
    address: 'Plot 88, Sector Centre D, Idu Industrial District, Abuja, FCT',
    managerName: 'Hajiya Aisha Danjuma',
    phone: '+234 9 461 8200'
  },
  {
    id: 'br-ph',
    companyId: 'comp-01',
    name: 'Port Harcourt Niger Delta Terminal',
    code: 'BR-PHC-NG',
    city: 'Port Harcourt, Rivers State',
    country: 'Nigeria',
    address: '12 Trans-Amadi Industrial Layout, Port Harcourt, Rivers State',
    managerName: 'Nnamdi Okonkwo',
    phone: '+234 84 555 120'
  }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-los-01',
    branchId: 'br-los',
    name: 'Ikeja Central Fulfillment Hub',
    code: 'WH-LOS-FC1',
    address: 'Plot 14, Commercial Avenue, Gate 3, Ikeja Industrial Estate, Lagos',
    totalAreaSqFt: 180000,
    zones: [
      { id: 'zone-stg', name: 'Inbound Staging Area', type: 'staging', color: '#f59e0b', totalLocations: 4, occupiedLocations: 2 },
      { id: 'zone-pck', name: 'High-Velocity Pick Bins', type: 'pick_bin', color: '#3b82f6', totalLocations: 12, occupiedLocations: 8 },
      { id: 'zone-blk', name: 'Bulk Pallet Racks', type: 'bulk_pallet', color: '#8b5cf6', totalLocations: 8, occupiedLocations: 5 },
      { id: 'zone-cld', name: 'Cold-Chain Vaccine Vault (-20°C)', type: 'cold_storage', color: '#06b6d4', totalLocations: 4, occupiedLocations: 2 },
      { id: 'zone-qua', name: 'NAFDAC & Quality Quarantine', type: 'quarantine', color: '#ef4444', totalLocations: 4, occupiedLocations: 1 },
      { id: 'zone-dsp', name: 'Outbound Dispatch Docks', type: 'dispatch', color: '#10b981', totalLocations: 4, occupiedLocations: 2 }
    ],
    locations: [
      // Staging
      { id: 'LOC-STG-01', warehouseId: 'wh-los-01', zone: 'Staging', aisle: 'STG', rack: '01', shelf: '01', bin: 'A', barcode: 'LOC-STG-01', maxCapacityKg: 5000, currentCapacityKg: 850, isColdChain: false, status: 'occupied' },
      { id: 'LOC-STG-02', warehouseId: 'wh-los-01', zone: 'Staging', aisle: 'STG', rack: '01', shelf: '02', bin: 'B', barcode: 'LOC-STG-02', maxCapacityKg: 5000, currentCapacityKg: 420, isColdChain: false, status: 'occupied' },
      { id: 'LOC-STG-03', warehouseId: 'wh-los-01', zone: 'Staging', aisle: 'STG', rack: '02', shelf: '01', bin: 'A', barcode: 'LOC-STG-03', maxCapacityKg: 5000, currentCapacityKg: 0, isColdChain: false, status: 'available' },
      
      // Pick Bins
      { id: 'LOC-PCK-A01-01', warehouseId: 'wh-los-01', zone: 'Pick Bins', aisle: 'A01', rack: 'R01', shelf: 'S01', bin: 'B01', barcode: 'LOC-PCK-A01-01', maxCapacityKg: 350, currentCapacityKg: 120, isColdChain: false, status: 'occupied' },
      { id: 'LOC-PCK-A01-02', warehouseId: 'wh-los-01', zone: 'Pick Bins', aisle: 'A01', rack: 'R01', shelf: 'S02', bin: 'B02', barcode: 'LOC-PCK-A01-02', maxCapacityKg: 350, currentCapacityKg: 190, isColdChain: false, status: 'occupied' },
      { id: 'LOC-PCK-A01-03', warehouseId: 'wh-los-01', zone: 'Pick Bins', aisle: 'A01', rack: 'R02', shelf: 'S01', bin: 'B01', barcode: 'LOC-PCK-A01-03', maxCapacityKg: 350, currentCapacityKg: 0, isColdChain: false, status: 'available' },
      { id: 'LOC-PCK-A02-01', warehouseId: 'wh-los-01', zone: 'Pick Bins', aisle: 'A02', rack: 'R01', shelf: 'S01', bin: 'B01', barcode: 'LOC-PCK-A02-01', maxCapacityKg: 350, currentCapacityKg: 280, isColdChain: false, status: 'occupied' },
      { id: 'LOC-PCK-A02-02', warehouseId: 'wh-los-01', zone: 'Pick Bins', aisle: 'A02', rack: 'R01', shelf: 'S02', bin: 'B02', barcode: 'LOC-PCK-A02-02', maxCapacityKg: 350, currentCapacityKg: 140, isColdChain: false, status: 'occupied' },
      
      // Bulk Pallets
      { id: 'LOC-BLK-B01-01', warehouseId: 'wh-los-01', zone: 'Bulk Pallets', aisle: 'B01', rack: 'R01', shelf: 'S01', bin: 'P01', barcode: 'LOC-BLK-B01-01', maxCapacityKg: 2000, currentCapacityKg: 1650, isColdChain: false, status: 'occupied' },
      { id: 'LOC-BLK-B01-02', warehouseId: 'wh-los-01', zone: 'Bulk Pallets', aisle: 'B01', rack: 'R02', shelf: 'S01', bin: 'P02', barcode: 'LOC-BLK-B01-02', maxCapacityKg: 2000, currentCapacityKg: 820, isColdChain: false, status: 'occupied' },
      { id: 'LOC-BLK-B02-01', warehouseId: 'wh-los-01', zone: 'Bulk Pallets', aisle: 'B02', rack: 'R01', shelf: 'S01', bin: 'P01', barcode: 'LOC-BLK-B02-01', maxCapacityKg: 2000, currentCapacityKg: 0, isColdChain: false, status: 'available' },

      // Cold Storage
      { id: 'LOC-CLD-C01-01', warehouseId: 'wh-los-01', zone: 'Cold Storage', aisle: 'C01', rack: 'R01', shelf: 'S01', bin: 'V01', barcode: 'LOC-CLD-C01-01', maxCapacityKg: 500, currentCapacityKg: 180, isColdChain: true, status: 'occupied' },
      { id: 'LOC-CLD-C01-02', warehouseId: 'wh-los-01', zone: 'Cold Storage', aisle: 'C01', rack: 'R01', shelf: 'S02', bin: 'V02', barcode: 'LOC-CLD-C01-02', maxCapacityKg: 500, currentCapacityKg: 0, isColdChain: true, status: 'available' },

      // Quarantine
      { id: 'LOC-QUA-Q01-01', warehouseId: 'wh-los-01', zone: 'Quarantine', aisle: 'Q01', rack: 'R01', shelf: 'S01', bin: 'H01', barcode: 'LOC-QUA-Q01-01', maxCapacityKg: 800, currentCapacityKg: 65, isColdChain: false, status: 'occupied' },

      // Dispatch
      { id: 'LOC-DSP-D01-01', warehouseId: 'wh-los-01', zone: 'Dispatch Dock', aisle: 'D01', rack: 'R01', shelf: 'S01', bin: 'BAY1', barcode: 'LOC-DSP-D01-01', maxCapacityKg: 5000, currentCapacityKg: 650, isColdChain: false, status: 'occupied' },
      { id: 'LOC-DSP-D01-02', warehouseId: 'wh-los-01', zone: 'Dispatch Dock', aisle: 'D01', rack: 'R01', shelf: 'S02', bin: 'BAY2', barcode: 'LOC-DSP-D01-02', maxCapacityKg: 5000, currentCapacityKg: 0, isColdChain: false, status: 'available' }
    ]
  },
  {
    id: 'wh-abj-01',
    branchId: 'br-abj',
    name: 'Abuja Idu Logistics Hub',
    code: 'WH-ABJ-D01',
    address: 'Plot 88, Sector Centre D, Idu Industrial District, Abuja, FCT',
    totalAreaSqFt: 55000,
    zones: [
      { id: 'z-abj-1', name: 'Staging & Cross-dock', type: 'staging', color: '#f59e0b', totalLocations: 2, occupiedLocations: 1 },
      { id: 'z-abj-2', name: 'High-Density Bins', type: 'pick_bin', color: '#3b82f6', totalLocations: 8, occupiedLocations: 4 }
    ],
    locations: [
      { id: 'LOC-ABJ-01', warehouseId: 'wh-abj-01', zone: 'Staging', aisle: 'S1', rack: 'R1', shelf: 'S1', bin: 'A', barcode: 'LOC-ABJ-01', maxCapacityKg: 1000, currentCapacityKg: 300, isColdChain: false, status: 'occupied' }
    ]
  },
  {
    id: 'wh-ph-01',
    branchId: 'br-ph',
    name: 'Port Harcourt Trans-Amadi Depot',
    code: 'WH-PHC-G1',
    address: '12 Trans-Amadi Industrial Layout, Port Harcourt, Rivers State',
    totalAreaSqFt: 95000,
    zones: [
      { id: 'z-ph-1', name: 'Bonded Oil & Gas Staging', type: 'staging', color: '#f59e0b', totalLocations: 4, occupiedLocations: 2 },
      { id: 'z-ph-2', name: 'Heavy Pallet Storage', type: 'bulk_pallet', color: '#8b5cf6', totalLocations: 10, occupiedLocations: 7 }
    ],
    locations: [
      { id: 'LOC-PHC-01', warehouseId: 'wh-ph-01', zone: 'Staging', aisle: 'S1', rack: 'R1', shelf: 'S1', bin: 'A', barcode: 'LOC-PHC-01', maxCapacityKg: 4000, currentCapacityKg: 1200, isColdChain: false, status: 'occupied' }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Dr. Folashade Adeyemi',
    email: 'folashade.adeyemi@ekologistics.ng',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    companyId: 'comp-01',
    branchId: 'br-los',
    assignedWarehouseIds: ['wh-los-01', 'wh-abj-01', 'wh-ph-01'],
    status: 'active',
    lastActive: '2026-10-01T15:45:00Z'
  },
  {
    id: 'usr-sup',
    name: 'Chukwuma Eze',
    email: 'chukwuma.eze@ekologistics.ng',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    companyId: 'comp-01',
    branchId: 'br-los',
    assignedWarehouseIds: ['wh-los-01'],
    status: 'active',
    lastActive: '2026-10-01T16:10:00Z'
  },
  {
    id: 'usr-off',
    name: 'Tunde Balogun',
    email: 'tunde.balogun@ekologistics.ng',
    role: 'officer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    companyId: 'comp-01',
    branchId: 'br-los',
    assignedWarehouseIds: ['wh-los-01'],
    status: 'active',
    lastActive: '2026-10-01T16:32:00Z'
  },
  {
    id: 'usr-aud',
    name: 'Zainab Abubakar',
    email: 'zainab.abubakar@compliance.gov.ng',
    role: 'auditor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    companyId: 'comp-01',
    branchId: 'br-los',
    assignedWarehouseIds: ['wh-los-01', 'wh-abj-01', 'wh-ph-01'],
    status: 'active',
    lastActive: '2026-10-01T14:20:00Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    sku: 'SKU-ROB-880',
    name: 'Innoson Industrial 6-Axis Gripper Arm',
    barcode: '793573198001',
    category: 'Robotics',
    unit: 'PCS',
    unitCost: 2150000.00,
    unitPrice: 3200000.00,
    weightKg: 12.5,
    reorderPoint: 5,
    targetStock: 25,
    currentStock: 14,
    allocatedStock: 2,
    requiresLotTracking: true,
    imageUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-02',
    sku: 'SKU-IOT-102',
    name: 'MainOne Industrial BLE 5.3 Sensor Beacon (Pack of 10)',
    barcode: '793573198002',
    category: 'Electronics',
    unit: 'BOX',
    unitCost: 65000.00,
    unitPrice: 120000.00,
    weightKg: 0.8,
    reorderPoint: 20,
    targetStock: 100,
    currentStock: 82,
    allocatedStock: 15,
    requiresLotTracking: true,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-03',
    sku: 'SKU-MED-440',
    name: 'Emzor Cryogenic Cold-Chain Biologics Vial 50ml',
    barcode: '793573198003',
    category: 'Medical',
    unit: 'PCS',
    unitCost: 890000.00,
    unitPrice: 1450000.00,
    weightKg: 0.25,
    reorderPoint: 15,
    targetStock: 50,
    currentStock: 32,
    allocatedStock: 4,
    isColdChain: true,
    requiresLotTracking: true,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-04',
    sku: 'SKU-BAT-900',
    name: 'Zinox 48V 100Ah High-Density Solar Lithium Pack',
    barcode: '793573198004',
    category: 'Industrial',
    unit: 'PCS',
    unitCost: 1250000.00,
    unitPrice: 1850000.00,
    weightKg: 42.0,
    reorderPoint: 4,
    targetStock: 16,
    currentStock: 9,
    allocatedStock: 3,
    requiresLotTracking: true,
    imageUrl: 'https://images.unsplash.com/photo-1558441719-8b489c652756?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-05',
    sku: 'SKU-SCN-210',
    name: 'MTN Rugged Android IP67 Handheld Barcode Scanner',
    barcode: '793573198005',
    category: 'Electronics',
    unit: 'PCS',
    unitCost: 540000.00,
    unitPrice: 820000.00,
    weightKg: 0.65,
    reorderPoint: 8,
    targetStock: 30,
    currentStock: 24,
    allocatedStock: 6,
    requiresLotTracking: true,
    imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-06',
    sku: 'SKU-DRN-550',
    name: 'Eko Surveillance LiDAR Scanning Inspection Drone',
    barcode: '793573198006',
    category: 'Robotics',
    unit: 'PCS',
    unitCost: 3400000.00,
    unitPrice: 5200000.00,
    weightKg: 4.8,
    reorderPoint: 2,
    targetStock: 8,
    currentStock: 5,
    allocatedStock: 1,
    requiresLotTracking: true,
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-07',
    sku: 'SKU-PKG-010',
    name: 'BUA Reinforced 3-Ply Corrugated Heavy Carton (Box of 50)',
    barcode: '793573198007',
    category: 'Consumer Goods',
    unit: 'BOX',
    unitCost: 45000.00,
    unitPrice: 75000.00,
    weightKg: 18.0,
    reorderPoint: 30,
    targetStock: 150,
    currentStock: 110,
    allocatedStock: 20,
    requiresLotTracking: false,
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_INVENTORY_STOCK: InventoryItemStock[] = [
  { id: 'stk-01', productId: 'prod-01', warehouseId: 'wh-los-01', locationId: 'LOC-BLK-B01-01', locationCode: 'BLK-B01-R01-P01', lotNumber: 'LOT-2026-ARM-01', quantity: 10, receivedDate: '2026-09-12', status: 'available' },
  { id: 'stk-02', productId: 'prod-01', warehouseId: 'wh-los-01', locationId: 'LOC-PCK-A01-01', locationCode: 'PCK-A01-R01-B01', lotNumber: 'LOT-2026-ARM-02', quantity: 4, receivedDate: '2026-09-24', status: 'available' },
  { id: 'stk-03', productId: 'prod-02', warehouseId: 'wh-los-01', locationId: 'LOC-PCK-A01-02', locationCode: 'PCK-A01-R01-B02', lotNumber: 'LOT-2026-BLE-09', quantity: 62, receivedDate: '2026-09-28', status: 'available' },
  { id: 'stk-04', productId: 'prod-02', warehouseId: 'wh-los-01', locationId: 'LOC-STG-02', locationCode: 'STG-01-02-B', lotNumber: 'LOT-2026-BLE-10', quantity: 20, receivedDate: '2026-10-01', status: 'available' },
  { id: 'stk-05', productId: 'prod-03', warehouseId: 'wh-los-01', locationId: 'LOC-CLD-C01-01', locationCode: 'CLD-C01-R01-V01', lotNumber: 'LOT-BIO-449A', expiryDate: '2027-03-31', quantity: 32, receivedDate: '2026-09-15', status: 'available' },
  { id: 'stk-06', productId: 'prod-04', warehouseId: 'wh-los-01', locationId: 'LOC-BLK-B01-02', locationCode: 'BLK-B01-R02-P02', lotNumber: 'LOT-BAT-2026-88', quantity: 9, receivedDate: '2026-09-20', status: 'available' },
  { id: 'stk-07', productId: 'prod-05', warehouseId: 'wh-los-01', locationId: 'LOC-PCK-A02-01', locationCode: 'PCK-A02-R01-B01', lotNumber: 'LOT-SCN-2026-44', quantity: 24, receivedDate: '2026-09-18', status: 'available' },
  { id: 'stk-08', productId: 'prod-06', warehouseId: 'wh-los-01', locationId: 'LOC-PCK-A02-02', locationCode: 'PCK-A02-R01-B02', lotNumber: 'LOT-DRN-2026-01', quantity: 5, receivedDate: '2026-09-22', status: 'available' },
  { id: 'stk-09', productId: 'prod-07', warehouseId: 'wh-los-01', locationId: 'LOC-BLK-B01-01', locationCode: 'BLK-B01-R01-P01', lotNumber: 'LOT-BOX-2026-09', quantity: 110, receivedDate: '2026-09-25', status: 'available' },
  { id: 'stk-10', productId: 'prod-02', warehouseId: 'wh-los-01', locationId: 'LOC-QUA-Q01-01', locationCode: 'QUA-Q01-R01-H01', lotNumber: 'LOT-2026-BLE-RET', quantity: 2, receivedDate: '2026-09-30', status: 'quarantined' }
];

export const INITIAL_INBOUND_RECEIPTS: InboundReceipt[] = [
  {
    id: 'rcp-01',
    receiptNumber: 'GRN-2026-0042',
    poNumber: 'PO-99410',
    supplierName: 'MainOne Cable & Data Systems Ltd',
    warehouseId: 'wh-los-01',
    expectedArrivalDate: '2026-10-01',
    status: 'ARRIVED',
    carrier: 'GIG Logistics (GIGL)',
    trackingNumber: 'GIGL-LOS-948102941',
    receivedByUserId: 'usr-off',
    receivedByUserName: 'Tunde Balogun',
    lines: [
      { productId: 'prod-02', expectedQty: 40, receivedQty: 0, acceptedQty: 0, damagedQty: 0, lotNumber: 'LOT-2026-BLE-11', stagingLocationId: 'LOC-STG-01' },
      { productId: 'prod-05', expectedQty: 10, receivedQty: 0, acceptedQty: 0, damagedQty: 0, lotNumber: 'LOT-SCN-2026-50', stagingLocationId: 'LOC-STG-01' }
    ],
    notes: 'Inbound container docked at Lagos Gate 2. Awaiting scan & inspection by Warehouse Officer.'
  },
  {
    id: 'rcp-02',
    receiptNumber: 'GRN-2026-0038',
    poNumber: 'PO-99385',
    supplierName: 'Zinox Technologies Group',
    warehouseId: 'wh-los-01',
    expectedArrivalDate: '2026-09-28',
    status: 'COMPLETED',
    carrier: 'DHL Express Nigeria',
    trackingNumber: 'DHL-NG-7749102',
    receivedByUserId: 'usr-off',
    receivedByUserName: 'Tunde Balogun',
    receivedAt: '2026-09-28T11:15:00Z',
    lines: [
      { productId: 'prod-01', expectedQty: 4, receivedQty: 4, acceptedQty: 4, damagedQty: 0, lotNumber: 'LOT-2026-ARM-02', stagingLocationId: 'LOC-STG-01' }
    ],
    notes: 'Docked and accepted at Ikeja facility with zero transit damage. Official GRN issued.'
  }
];

export const INITIAL_PUTAWAY_TASKS: PutawayTask[] = [
  {
    id: 'put-01',
    receiptId: 'rcp-02',
    receiptNumber: 'GRN-2026-0038',
    productId: 'prod-01',
    warehouseId: 'wh-los-01',
    fromLocationId: 'LOC-STG-01',
    suggestedLocationId: 'LOC-PCK-A01-01',
    quantity: 4,
    lotNumber: 'LOT-2026-ARM-02',
    status: 'PENDING',
    assignedToUserId: 'usr-off',
    assignedToUserName: 'Tunde Balogun'
  },
  {
    id: 'put-02',
    receiptId: 'rcp-02',
    receiptNumber: 'GRN-2026-0035',
    productId: 'prod-03',
    warehouseId: 'wh-los-01',
    fromLocationId: 'LOC-STG-02',
    suggestedLocationId: 'LOC-CLD-C01-01',
    quantity: 12,
    lotNumber: 'LOT-BIO-449A',
    status: 'PENDING',
    assignedToUserId: 'usr-off',
    assignedToUserName: 'Tunde Balogun'
  }
];

export const INITIAL_OUTBOUND_ORDERS: OutboundOrder[] = [
  {
    id: 'ord-01',
    orderNumber: 'ORD-2026-1089',
    customerName: 'Dangote Cement & Infrastructure Plc',
    destinationAddress: '1 Alfred Rewane Road, Ikoyi, Lagos State',
    warehouseId: 'wh-los-01',
    orderDate: '2026-10-01T09:30:00Z',
    priority: 'CRITICAL',
    status: 'PENDING_PICK',
    items: [
      { productId: 'prod-01', requestedQty: 2, pickedQty: 0, locationId: 'LOC-PCK-A01-01', lotNumber: 'LOT-2026-ARM-02' },
      { productId: 'prod-02', requestedQty: 10, pickedQty: 0, locationId: 'LOC-PCK-A01-02', lotNumber: 'LOT-2026-BLE-09' }
    ]
  },
  {
    id: 'ord-02',
    orderNumber: 'ORD-2026-1085',
    customerName: 'Emzor Pharmaceuticals Industries Ltd',
    destinationAddress: 'Plot 3C, Block A, Ajao Estate, Isolo, Lagos State',
    warehouseId: 'wh-los-01',
    orderDate: '2026-09-30T14:00:00Z',
    priority: 'HIGH',
    status: 'PICKED',
    items: [
      { productId: 'prod-03', requestedQty: 4, pickedQty: 4, locationId: 'LOC-CLD-C01-01', lotNumber: 'LOT-BIO-449A' }
    ]
  },
  {
    id: 'ord-03',
    orderNumber: 'ORD-2026-1077',
    customerName: 'Flutterwave Technology Hub',
    destinationAddress: '8 Lekki Phase 1 Commercial Gate, Lekki, Lagos State',
    warehouseId: 'wh-los-01',
    orderDate: '2026-09-29T10:15:00Z',
    priority: 'NORMAL',
    status: 'PACKING',
    items: [
      { productId: 'prod-05', requestedQty: 6, pickedQty: 6, locationId: 'LOC-PCK-A02-01', lotNumber: 'LOT-SCN-2026-44' }
    ]
  }
];

export const INITIAL_PICK_WAVES: PickWave[] = [
  {
    id: 'wave-01',
    waveNumber: 'WAVE-2026-091',
    warehouseId: 'wh-los-01',
    orderIds: ['ord-01'],
    status: 'CREATED',
    assignedToUserId: 'usr-off',
    assignedToUserName: 'Tunde Balogun',
    totalItems: 12,
    pickedItems: 0,
    createdAt: '2026-10-01T10:00:00Z'
  }
];

export const INITIAL_DISPATCH_SHIPMENTS: DispatchShipment[] = [
  {
    id: 'dsp-01',
    shipmentNumber: 'DSP-2026-088',
    orderId: 'ord-02',
    orderNumber: 'ORD-2026-1085',
    customerName: 'Emzor Pharmaceuticals Industries Ltd',
    warehouseId: 'wh-los-01',
    carrier: 'GIG Logistics (GIGL)',
    trackingNumber: 'GIGL-NG-9938102381',
    packageType: 'Medium Box',
    weightKg: 2.8,
    boxCount: 1,
    shippingAddress: 'Plot 3C, Block A, Ajao Estate, Isolo, Lagos State',
    bolNumber: 'BOL-LOS-2026-940',
    status: 'PACKED'
  }
];

export const INITIAL_RETURNS: ReturnOrder[] = [
  {
    id: 'rma-01',
    rmaNumber: 'RMA-2026-033',
    originalOrderNumber: 'ORD-2026-0982',
    customerName: 'Oando Clean Energy Ltd',
    warehouseId: 'wh-los-01',
    status: 'INSPECTION',
    returnReason: 'DAMAGED_IN_TRANSIT',
    createdAt: '2026-09-30T11:45:00Z',
    items: [
      {
        productId: 'prod-02',
        quantity: 2,
        inspectionGrading: 'GRADE_C_QUARANTINE',
        disposition: 'MOVE_TO_QUARANTINE',
        targetLocationId: 'LOC-QUA-Q01-01',
        notes: 'Outer packaging crushed in transit. Unit requires bench diagnostic test before restock.'
      }
    ]
  }
];

export const INITIAL_ADJUSTMENTS: StockAdjustmentRequest[] = [
  {
    id: 'adj-01',
    warehouseId: 'wh-los-01',
    productId: 'prod-02',
    locationId: 'LOC-PCK-A01-02',
    requestedByUserId: 'usr-off',
    requestedByUserName: 'Tunde Balogun (Warehouse Officer)',
    requestedDate: '2026-10-01T14:30:00Z',
    previousQty: 65,
    adjustedQty: 62,
    differenceQty: -3,
    reasonCode: 'COUNT_DISCREPANCY',
    notes: 'Physical cycle count conducted at Bin A01-R01-B02 showed 62 boxes instead of 65. Requesting discrepancy write-down.',
    status: 'PENDING_SUPERVISOR_APPROVAL'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter WOS (Nigeria)',
    priceMonthlyUsd: 350000,
    maxWarehouses: 1,
    maxUsers: 5,
    monthlyScansQuota: 3000,
    slaHours: 24,
    features: ['1 Warehouse Facility', '5 User Seats', 'Inbound & Putaway', 'Wave Picking', 'Email Support']
  },
  {
    id: 'growth',
    name: 'Professional Multi-Hub (Nigeria)',
    priceMonthlyUsd: 950000,
    maxWarehouses: 3,
    maxUsers: 20,
    monthlyScansQuota: 25000,
    slaHours: 8,
    features: ['3 Warehouses & Multi-hub', '20 User Seats', 'Full Inbound/Outbound', 'Reverse Logistics (RMA)', 'Cryptographic Audit Trail', 'Priority Phone Support']
  },
  {
    id: 'enterprise',
    name: 'Global Enterprise Core (Nigeria)',
    priceMonthlyUsd: 2400000,
    maxWarehouses: 10,
    maxUsers: 100,
    monthlyScansQuota: 200000,
    slaHours: 1,
    features: ['Unlimited Warehouses & Zones', '100+ User Seats', 'Immutable Ledger Verification', 'ERP / EDI Integration APIs', 'Dedicated Account Architect', 'Custom SLA 99.99%']
  }
];

// Seed 10 block chained audit logs
const genesisHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
let currentHash = genesisHash;

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-01',
    blockNumber: 1,
    timestamp: '2026-09-28T08:00:00Z',
    actorId: 'usr-admin',
    actorName: 'Dr. Folashade Adeyemi',
    actorRole: 'admin',
    action: 'SYSTEM_GENESIS',
    module: 'company',
    description: 'System initialized. Company tenant "Eko Integrated Logistics Nigeria Ltd" registered with Growth subscription.',
    targetId: 'comp-01',
    ipAddress: '102.89.23.44',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'SYSTEM_GENESIS', '2026-09-28T08:00:00Z', 'Dr. Folashade Adeyemi'))
  },
  {
    id: 'audit-02',
    blockNumber: 2,
    timestamp: '2026-09-28T08:15:00Z',
    actorId: 'usr-admin',
    actorName: 'Dr. Folashade Adeyemi',
    actorRole: 'admin',
    action: 'BRANCH_CREATED',
    module: 'company',
    description: 'Branch "Lagos Commercial Gateway Hub" (BR-LOS-NG) registered in Ikeja Industrial Estate.',
    targetId: 'br-los',
    ipAddress: '102.89.23.44',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'BRANCH_CREATED', '2026-09-28T08:15:00Z', 'Dr. Folashade Adeyemi'))
  },
  {
    id: 'audit-03',
    blockNumber: 3,
    timestamp: '2026-09-28T08:30:00Z',
    actorId: 'usr-admin',
    actorName: 'Dr. Folashade Adeyemi',
    actorRole: 'admin',
    action: 'WAREHOUSE_REGISTERED',
    module: 'company',
    description: 'Warehouse "Ikeja Central Fulfillment Hub" (WH-LOS-FC1) with 6 zones mapped.',
    targetId: 'wh-los-01',
    ipAddress: '102.89.23.44',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'WAREHOUSE_REGISTERED', '2026-09-28T08:30:00Z', 'Dr. Folashade Adeyemi'))
  },
  {
    id: 'audit-04',
    blockNumber: 4,
    timestamp: '2026-09-28T09:00:00Z',
    actorId: 'usr-admin',
    actorName: 'Dr. Folashade Adeyemi',
    actorRole: 'admin',
    action: 'USER_ROLE_ASSIGNED',
    module: 'users',
    description: 'User "Chukwuma Eze" assigned role "Warehouse Supervisor".',
    targetId: 'usr-sup',
    ipAddress: '102.89.23.44',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'USER_ROLE_ASSIGNED', '2026-09-28T09:00:00Z', 'Dr. Folashade Adeyemi'))
  },
  {
    id: 'audit-05',
    blockNumber: 5,
    timestamp: '2026-09-28T09:10:00Z',
    actorId: 'usr-admin',
    actorName: 'Dr. Folashade Adeyemi',
    actorRole: 'admin',
    action: 'USER_ROLE_ASSIGNED',
    module: 'users',
    description: 'User "Tunde Balogun" assigned role "Warehouse Officer" with operational scan access.',
    targetId: 'usr-off',
    ipAddress: '102.89.23.44',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'USER_ROLE_ASSIGNED', '2026-09-28T09:10:00Z', 'Dr. Folashade Adeyemi'))
  },
  {
    id: 'audit-06',
    blockNumber: 6,
    timestamp: '2026-09-28T11:15:00Z',
    actorId: 'usr-off',
    actorName: 'Tunde Balogun',
    actorRole: 'officer',
    action: 'GOODS_RECEIVED',
    module: 'receiving',
    description: 'Received 4 units of SKU-ROB-880 against PO-99385. Generated GRN-2026-0038.',
    targetId: 'rcp-02',
    ipAddress: '197.210.64.12',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'GOODS_RECEIVED', '2026-09-28T11:15:00Z', 'Tunde Balogun'))
  },
  {
    id: 'audit-07',
    blockNumber: 7,
    timestamp: '2026-09-28T13:40:00Z',
    actorId: 'usr-off',
    actorName: 'Tunde Balogun',
    actorRole: 'officer',
    action: 'PUTAWAY_DIRECTED',
    module: 'putaway',
    description: 'Put-away task generated for GRN-2026-0038 moving items from STG-01 to Pick Bins.',
    targetId: 'put-01',
    ipAddress: '197.210.64.12',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'PUTAWAY_DIRECTED', '2026-09-28T13:40:00Z', 'Tunde Balogun'))
  },
  {
    id: 'audit-08',
    blockNumber: 8,
    timestamp: '2026-09-30T14:20:00Z',
    actorId: 'usr-off',
    actorName: 'Tunde Balogun',
    actorRole: 'officer',
    action: 'ORDER_PICKED',
    module: 'picking',
    description: 'Order ORD-2026-1085 picked and transferred to packing station.',
    targetId: 'ord-02',
    ipAddress: '197.210.64.12',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'ORDER_PICKED', '2026-09-30T14:20:00Z', 'Tunde Balogun'))
  },
  {
    id: 'audit-09',
    blockNumber: 9,
    timestamp: '2026-10-01T14:30:00Z',
    actorId: 'usr-off',
    actorName: 'Tunde Balogun',
    actorRole: 'officer',
    action: 'ADJUSTMENT_REQUESTED',
    module: 'inventory',
    description: 'Submitted stock discrepancy adjustment (-3 units) on SKU-IOT-102. Pending supervisor sign-off.',
    targetId: 'adj-01',
    ipAddress: '197.210.64.12',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'ADJUSTMENT_REQUESTED', '2026-10-01T14:30:00Z', 'Tunde Balogun'))
  },
  {
    id: 'audit-10',
    blockNumber: 10,
    timestamp: '2026-10-01T14:45:00Z',
    actorId: 'usr-aud',
    actorName: 'Zainab Abubakar',
    actorRole: 'auditor',
    action: 'LEDGER_INTEGRITY_VERIFIED',
    module: 'audit',
    description: 'Compliance auditor performed cryptographic hash chain audit. 0 anomalies detected.',
    targetId: 'audit-chain',
    ipAddress: '197.210.78.91',
    previousHash: currentHash,
    hash: (currentHash = computeBlockHashSync(currentHash, 'LEDGER_INTEGRITY_VERIFIED', '2026-10-01T14:45:00Z', 'Zainab Abubakar'))
  }
];
