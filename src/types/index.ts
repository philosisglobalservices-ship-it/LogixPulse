// Core Domain Types for Warehouse Operating System (WOS)

export type RoleType = 'admin' | 'supervisor' | 'officer' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatar: string;
  companyId: string;
  branchId: string;
  assignedWarehouseIds: string[];
  status: 'active' | 'suspended';
  lastActive: string;
}

export interface PermissionDefinition {
  code: string;
  name: string;
  module: 'company' | 'inventory' | 'receiving' | 'putaway' | 'picking' | 'dispatch' | 'returns' | 'audit' | 'billing';
  description: string;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  taxId: string;
  currency: string;
  logoUrl?: string;
  createdAt: string;
  subscriptionPlanId: 'starter' | 'growth' | 'enterprise';
  subscriptionStatus: 'active' | 'past_due' | 'trial';
  maxWarehouses: number;
  maxUsers: number;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  code: string;
  city: string;
  country: string;
  address: string;
  managerName: string;
  phone: string;
}

export interface StorageLocation {
  id: string; // e.g. "LOC-Z1-A01-R01-S01-B01"
  warehouseId: string;
  zone: string; // e.g. "Staging", "Pick Bins", "Bulk Pallets", "Cold Storage", "Quarantine", "Dispatch Dock"
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  barcode: string;
  maxCapacityKg: number;
  currentCapacityKg: number;
  isColdChain: boolean;
  status: 'available' | 'occupied' | 'full' | 'maintenance';
}

export interface WarehouseZone {
  id: string;
  name: string;
  type: 'staging' | 'pick_bin' | 'bulk_pallet' | 'cold_storage' | 'quarantine' | 'dispatch';
  color: string;
  totalLocations: number;
  occupiedLocations: number;
}

export interface Warehouse {
  id: string;
  branchId: string;
  name: string;
  code: string;
  address: string;
  totalAreaSqFt: number;
  zones: WarehouseZone[];
  locations: StorageLocation[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  category: 'Electronics' | 'Robotics' | 'Medical' | 'Industrial' | 'Consumer Goods';
  unit: 'PCS' | 'BOX' | 'PALLET' | 'KG';
  unitCost: number;
  unitPrice: number;
  weightKg: number;
  reorderPoint: number;
  targetStock: number;
  currentStock: number;
  allocatedStock: number;
  isColdChain?: boolean;
  requiresLotTracking?: boolean;
  imageUrl?: string;
}

export interface InventoryItemStock {
  id: string;
  productId: string;
  warehouseId: string;
  locationId: string; // StorageLocation id
  locationCode: string; // human readable like Z1-A01-R01-B01
  lotNumber: string;
  expiryDate?: string;
  quantity: number;
  receivedDate: string;
  status: 'available' | 'reserved' | 'quarantined' | 'damaged';
}

export interface StockAdjustmentRequest {
  id: string;
  warehouseId: string;
  productId: string;
  locationId: string;
  requestedByUserId: string;
  requestedByUserName: string;
  requestedDate: string;
  previousQty: number;
  adjustedQty: number;
  differenceQty: number;
  reasonCode: 'COUNT_DISCREPANCY' | 'DAMAGED_IN_RACK' | 'EXPIRED_LOT' | 'FOUND_ITEM' | 'THEFT_OR_LOSS';
  notes: string;
  status: 'PENDING_SUPERVISOR_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvedByUserId?: string;
  approvedByUserName?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export interface ReceivingLine {
  productId: string;
  expectedQty: number;
  receivedQty: number;
  acceptedQty: number;
  damagedQty: number;
  lotNumber: string;
  expiryDate?: string;
  stagingLocationId?: string;
  notes?: string;
}

export interface InboundReceipt {
  id: string;
  receiptNumber: string; // e.g. "GRN-2026-0042"
  poNumber: string;
  supplierName: string;
  warehouseId: string;
  expectedArrivalDate: string;
  status: 'DRAFT' | 'ARRIVED' | 'RECEIVING' | 'COMPLETED' | 'CANCELLED';
  carrier: string;
  trackingNumber: string;
  lines: ReceivingLine[];
  receivedByUserId?: string;
  receivedByUserName?: string;
  receivedAt?: string;
  notes?: string;
}

export interface PutawayTask {
  id: string;
  receiptId: string;
  receiptNumber: string;
  productId: string;
  warehouseId: string;
  fromLocationId: string; // Staging
  suggestedLocationId: string;
  actualLocationId?: string;
  quantity: number;
  lotNumber: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedToUserId?: string;
  assignedToUserName?: string;
  completedAt?: string;
}

export interface PickOrderItem {
  productId: string;
  requestedQty: number;
  pickedQty: number;
  locationId: string;
  lotNumber?: string;
}

export interface OutboundOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-2026-1089"
  customerName: string;
  destinationAddress: string;
  warehouseId: string;
  orderDate: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: 'PENDING_PICK' | 'PICKING' | 'PICKED' | 'PACKING' | 'DISPATCHED' | 'DELIVERED';
  items: PickOrderItem[];
  waveId?: string;
}

export interface PickWave {
  id: string;
  waveNumber: string; // e.g. "WAVE-091"
  warehouseId: string;
  orderIds: string[];
  status: 'CREATED' | 'ASSIGNED' | 'PICKING' | 'COMPLETED';
  assignedToUserId?: string;
  assignedToUserName?: string;
  totalItems: number;
  pickedItems: number;
  createdAt: string;
  completedAt?: string;
}

export interface DispatchShipment {
  id: string;
  shipmentNumber: string; // e.g. "DSP-2026-088"
  orderId: string;
  orderNumber: string;
  customerName: string;
  warehouseId: string;
  carrier: 'GIG Logistics (GIGL)' | 'Red Star Express (FedEx)' | 'DHL Express Nigeria' | 'Kwik Delivery Fleet';
  trackingNumber: string;
  packageType: 'Small Box' | 'Medium Box' | 'Heavy Carton' | 'Pallet';
  weightKg: number;
  boxCount: number;
  shippingAddress: string;
  bolNumber: string; // Bill of Lading
  dispatchedAt?: string;
  dispatchedByUserName?: string;
  status: 'STAGED' | 'PACKED' | 'MANIFESTED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface ReturnOrder {
  id: string;
  rmaNumber: string; // e.g. "RMA-2026-033"
  originalOrderNumber: string;
  customerName: string;
  warehouseId: string;
  status: 'PENDING_RECEIPT' | 'INSPECTION' | 'COMPLETED' | 'REJECTED';
  returnReason: 'DAMAGED_IN_TRANSIT' | 'DEFECTIVE_PRODUCT' | 'WRONG_ITEM_SENT' | 'CUSTOMER_CANCELLED';
  items: {
    productId: string;
    quantity: number;
    inspectionGrading?: 'GRADE_A_RESTOCK' | 'GRADE_B_REFURBISH' | 'GRADE_C_QUARANTINE' | 'GRADE_D_SCRAP';
    disposition?: 'RESTOCK_TO_INVENTORY' | 'MOVE_TO_QUARANTINE' | 'DISPOSAL_SCRAP';
    targetLocationId?: string;
    notes?: string;
  }[];
  createdAt: string;
  inspectedByUserName?: string;
  completedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  blockNumber: number;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: RoleType;
  action: string; // e.g. "INVENTORY_ADJUST_APPROVED", "GOODS_RECEIVED", "DISPATCH_CONFIRMED"
  module: 'company' | 'inventory' | 'receiving' | 'putaway' | 'picking' | 'dispatch' | 'returns' | 'users' | 'security' | 'audit' | 'billing';
  description: string;
  targetId: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  previousHash: string;
  hash: string; // SHA-256 block hash
}

export interface SubscriptionPlan {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  priceMonthlyUsd: number;
  maxWarehouses: number;
  maxUsers: number;
  monthlyScansQuota: number;
  slaHours: number;
  features: string[];
}
