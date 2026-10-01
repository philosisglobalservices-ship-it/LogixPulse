import React, { createContext, useContext, useState, useEffect } from 'react';
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
  RoleType,
  StorageLocation
} from '../types';
import {
  INITIAL_COMPANY,
  INITIAL_BRANCHES,
  INITIAL_WAREHOUSES,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY_STOCK,
  INITIAL_INBOUND_RECEIPTS,
  INITIAL_PUTAWAY_TASKS,
  INITIAL_OUTBOUND_ORDERS,
  INITIAL_PICK_WAVES,
  INITIAL_DISPATCH_SHIPMENTS,
  INITIAL_RETURNS,
  INITIAL_ADJUSTMENTS,
  INITIAL_AUDIT_LOGS
} from '../services/seedData';
import { computeBlockHashSync } from '../utils/crypto';
import { hasPermission, Permission } from '../services/rbac';
import { soundFX } from '../utils/sound';

interface WarehouseContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  activeWarehouseId: string;
  setActiveWarehouseId: (id: string) => void;
  activeWarehouse: Warehouse;
  
  // Data State
  company: Company;
  branches: Branch[];
  warehouses: Warehouse[];
  users: User[];
  products: Product[];
  inventoryStock: InventoryItemStock[];
  adjustments: StockAdjustmentRequest[];
  receipts: InboundReceipt[];
  putawayTasks: PutawayTask[];
  orders: OutboundOrder[];
  pickWaves: PickWave[];
  shipments: DispatchShipment[];
  returns: ReturnOrder[];
  auditLogs: AuditLogEntry[];

  // RBAC check
  can: (permission: Permission) => boolean;

  // Operational Actions
  receiveInboundShipment: (receiptId: string, lines: { productId: string; receivedQty: number; acceptedQty: number; damagedQty: number; lotNumber: string; stagingLocId: string }[]) => { success: boolean; message: string };
  completePutaway: (taskId: string, targetLocationId: string) => { success: boolean; message: string };
  requestAdjustment: (productId: string, locationId: string, adjustedQty: number, reason: StockAdjustmentRequest['reasonCode'], notes: string) => { success: boolean; message: string };
  approveAdjustment: (adjustmentId: string, approve: boolean, notes?: string) => { success: boolean; message: string };
  createPickWave: (orderIds: string[]) => { success: boolean; message: string };
  completePickItem: (orderId: string, productId: string, pickedQty: number) => { success: boolean; message: string };
  packAndDispatchShipment: (orderId: string, carrier: DispatchShipment['carrier'], packageType: DispatchShipment['packageType'], weightKg: number) => { success: boolean; message: string; trackingNumber: string };
  processReturnRMA: (rmaId: string, items: ReturnOrder['items']) => { success: boolean; message: string };
  transferStockBetweenBins: (stockId: string, targetLocationId: string, qty: number) => { success: boolean; message: string };
  addNewLocation: (location: StorageLocation) => void;
  addNewProduct: (product: Product) => void;
  addNewWarehouse: (warehouse: Warehouse) => void;
  addNewUser: (user: User) => void;
  updateCompanyPlan: (planId: 'starter' | 'growth' | 'enterprise') => void;
  
  // Audit & Ledger verification
  verifyAuditIntegrity: () => { isValid: boolean; checkedBlocks: number; brokenBlockNumber?: number };
  resetToDemoData: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'eko_wos_ng_v2_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company>(() => loadFromStorage('company', INITIAL_COMPANY));
  const [branches, setBranches] = useState<Branch[]>(() => loadFromStorage('branches', INITIAL_BRANCHES));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => loadFromStorage('warehouses', INITIAL_WAREHOUSES));
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [inventoryStock, setInventoryStock] = useState<InventoryItemStock[]>(() => loadFromStorage('stock', INITIAL_INVENTORY_STOCK));
  const [adjustments, setAdjustments] = useState<StockAdjustmentRequest[]>(() => loadFromStorage('adjustments', INITIAL_ADJUSTMENTS));
  const [receipts, setReceipts] = useState<InboundReceipt[]>(() => loadFromStorage('receipts', INITIAL_INBOUND_RECEIPTS));
  const [putawayTasks, setPutawayTasks] = useState<PutawayTask[]>(() => loadFromStorage('putaway', INITIAL_PUTAWAY_TASKS));
  const [orders, setOrders] = useState<OutboundOrder[]>(() => loadFromStorage('orders', INITIAL_OUTBOUND_ORDERS));
  const [pickWaves, setPickWaves] = useState<PickWave[]>(() => loadFromStorage('pickwaves', INITIAL_PICK_WAVES));
  const [shipments, setShipments] = useState<DispatchShipment[]>(() => loadFromStorage('shipments', INITIAL_DISPATCH_SHIPMENTS));
  const [returns, setReturns] = useState<ReturnOrder[]>(() => loadFromStorage('returns', INITIAL_RETURNS));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadFromStorage('audit', INITIAL_AUDIT_LOGS));

  // Active session state
  const [currentUserId, setCurrentUserId] = useState<string>('usr-off'); // default to Warehouse Officer Tunde Balogun to experience frontline operations first
  const [activeWarehouseId, setActiveWarehouseId] = useState<string>('wh-los-01');

  // Persistence effects
  useEffect(() => saveToStorage('company', company), [company]);
  useEffect(() => saveToStorage('branches', branches), [branches]);
  useEffect(() => saveToStorage('warehouses', warehouses), [warehouses]);
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('stock', inventoryStock), [inventoryStock]);
  useEffect(() => saveToStorage('adjustments', adjustments), [adjustments]);
  useEffect(() => saveToStorage('receipts', receipts), [receipts]);
  useEffect(() => saveToStorage('putaway', putawayTasks), [putawayTasks]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('pickwaves', pickWaves), [pickWaves]);
  useEffect(() => saveToStorage('shipments', shipments), [shipments]);
  useEffect(() => saveToStorage('returns', returns), [returns]);
  useEffect(() => saveToStorage('audit', auditLogs), [auditLogs]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const activeWarehouse = warehouses.find(w => w.id === activeWarehouseId) || warehouses[0];

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      soundFX.playScanSuccess();
    }
  };

  const can = (permission: Permission): boolean => {
    return hasPermission(currentUser.role, permission);
  };

  // Helper to append a cryptographically linked block to the immutable audit trail
  const appendAuditLog = (
    action: string,
    module: AuditLogEntry['module'],
    description: string,
    targetId: string,
    metadata?: Record<string, any>
  ) => {
    const timestamp = new Date().toISOString();
    const lastLog = auditLogs[auditLogs.length - 1];
    const prevHash = lastLog ? lastLog.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';
    const blockNumber = (lastLog ? lastLog.blockNumber : 0) + 1;
    const newHash = computeBlockHashSync(prevHash, action, timestamp, currentUser.name);

    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      blockNumber,
      timestamp,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      module,
      description,
      targetId,
      metadata,
      ipAddress: '192.168.10.' + (Math.floor(Math.random() * 50) + 50),
      previousHash: prevHash,
      hash: newHash
    };

    setAuditLogs(prev => [...prev, newEntry]);
  };

  // INBOUND RECEIVING WORKFLOW
  const receiveInboundShipment = (
    receiptId: string,
    lines: { productId: string; receivedQty: number; acceptedQty: number; damagedQty: number; lotNumber: string; stagingLocId: string }[]
  ) => {
    if (!can('receiving:execute')) {
      soundFX.playScanError();
      return { success: false, message: `Access Denied: Role "${currentUser.role}" does not have permission "receiving:execute".` };
    }

    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) return { success: false, message: 'Receipt not found.' };

    const updatedReceipts = receipts.map(r => {
      if (r.id !== receiptId) return r;
      return {
        ...r,
        status: 'COMPLETED' as const,
        receivedByUserId: currentUser.id,
        receivedByUserName: currentUser.name,
        receivedAt: new Date().toISOString(),
        lines: lines.map(l => ({
          productId: l.productId,
          expectedQty: l.receivedQty,
          receivedQty: l.receivedQty,
          acceptedQty: l.acceptedQty,
          damagedQty: l.damagedQty,
          lotNumber: l.lotNumber,
          stagingLocationId: l.stagingLocId
        }))
      };
    });
    setReceipts(updatedReceipts);

    // Create Putaway tasks for accepted items and place into Staging
    const newPutaways: PutawayTask[] = [];
    const newStockEntries: InventoryItemStock[] = [];

    lines.forEach(line => {
      if (line.acceptedQty > 0) {
        const prod = products.find(p => p.id === line.productId);
        // Smart location recommendation
        let suggestedLocId = 'LOC-PCK-A01-03';
        if (prod?.isColdChain) {
          suggestedLocId = 'LOC-CLD-C01-02';
        } else if (line.acceptedQty >= 50) {
          suggestedLocId = 'LOC-BLK-B02-01';
        }

        const taskId = `put-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        newPutaways.push({
          id: taskId,
          receiptId: receipt.id,
          receiptNumber: receipt.receiptNumber,
          productId: line.productId,
          warehouseId: receipt.warehouseId,
          fromLocationId: line.stagingLocId || 'LOC-STG-01',
          suggestedLocationId: suggestedLocId,
          quantity: line.acceptedQty,
          lotNumber: line.lotNumber,
          status: 'PENDING',
          assignedToUserId: currentUser.id,
          assignedToUserName: currentUser.name
        });

        // Add to staging stock
        newStockEntries.push({
          id: `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: line.productId,
          warehouseId: receipt.warehouseId,
          locationId: line.stagingLocId || 'LOC-STG-01',
          locationCode: 'STAGING-INBOUND',
          lotNumber: line.lotNumber,
          quantity: line.acceptedQty,
          receivedDate: new Date().toISOString().split('T')[0],
          status: 'available'
        });
      }

      // If damaged, route to quarantine
      if (line.damagedQty > 0) {
        newStockEntries.push({
          id: `stk-dmg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: line.productId,
          warehouseId: receipt.warehouseId,
          locationId: 'LOC-QUA-Q01-01',
          locationCode: 'QUA-Q01-R01-H01',
          lotNumber: line.lotNumber,
          quantity: line.damagedQty,
          receivedDate: new Date().toISOString().split('T')[0],
          status: 'damaged'
        });
      }
    });

    setPutawayTasks(prev => [...newPutaways, ...prev]);
    setInventoryStock(prev => [...prev, ...newStockEntries]);

    // Update Product stock counts
    setProducts(prev => prev.map(p => {
      const match = lines.find(l => l.productId === p.id);
      if (match) {
        return { ...p, currentStock: p.currentStock + match.acceptedQty };
      }
      return p;
    }));

    appendAuditLog(
      'GOODS_RECEIVED_CONFIRMED',
      'receiving',
      `Goods Received Note ${receipt.receiptNumber} completed by ${currentUser.name}. Generated ${newPutaways.length} put-away routing tasks.`,
      receipt.id,
      { receiptNumber: receipt.receiptNumber, lines }
    );

    soundFX.playScanSuccess();
    return { success: true, message: `Successfully received inbound shipment ${receipt.receiptNumber}. GRN generated and put-away tasks routed.` };
  };

  // PUTAWAY WORKFLOW
  const completePutaway = (taskId: string, targetLocationId: string) => {
    if (!can('putaway:execute')) {
      soundFX.playScanError();
      return { success: false, message: `Access Denied: Role "${currentUser.role}" does not have permission "putaway:execute".` };
    }

    const task = putawayTasks.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Put-away task not found.' };

    const loc = activeWarehouse.locations.find(l => l.id === targetLocationId);
    const locCode = loc ? `${loc.zone.substring(0, 3).toUpperCase()}-${loc.aisle}-${loc.rack}-${loc.bin}` : targetLocationId;

    // Update task
    setPutawayTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        actualLocationId: targetLocationId,
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      };
    }));

    // Move stock from Staging to Destination Location
    setInventoryStock(prev => {
      const stagingStock = prev.find(s => s.productId === task.productId && s.locationId === task.fromLocationId && s.lotNumber === task.lotNumber);
      if (stagingStock) {
        if (stagingStock.quantity <= task.quantity) {
          // Remove staging stock and add destination
          return prev.filter(s => s.id !== stagingStock.id).concat({
            id: `stk-${Date.now()}`,
            productId: task.productId,
            warehouseId: task.warehouseId,
            locationId: targetLocationId,
            locationCode: locCode,
            lotNumber: task.lotNumber,
            quantity: task.quantity,
            receivedDate: new Date().toISOString().split('T')[0],
            status: 'available'
          });
        } else {
          // Decrement staging stock and add destination
          return prev.map(s => s.id === stagingStock.id ? { ...s, quantity: s.quantity - task.quantity } : s).concat({
            id: `stk-${Date.now()}`,
            productId: task.productId,
            warehouseId: task.warehouseId,
            locationId: targetLocationId,
            locationCode: locCode,
            lotNumber: task.lotNumber,
            quantity: task.quantity,
            receivedDate: new Date().toISOString().split('T')[0],
            status: 'available'
          });
        }
      } else {
        // Fallback create stock at destination
        return [...prev, {
          id: `stk-${Date.now()}`,
          productId: task.productId,
          warehouseId: task.warehouseId,
          locationId: targetLocationId,
          locationCode: locCode,
          lotNumber: task.lotNumber,
          quantity: task.quantity,
          receivedDate: new Date().toISOString().split('T')[0],
          status: 'available'
        }];
      }
    });

    appendAuditLog(
      'PUTAWAY_CONFIRMED',
      'putaway',
      `Put-away completed for ${task.quantity} units of ${task.productId} moved from ${task.fromLocationId} to ${locCode} by ${currentUser.name}.`,
      task.id,
      { taskId, targetLocationId, qty: task.quantity }
    );

    soundFX.playScanSuccess();
    return { success: true, message: `Put-away confirmed! Stored into bin ${locCode}.` };
  };

  // INVENTORY ADJUSTMENT WORKFLOW (FIRST-CLASS RBAC DEMO)
  const requestAdjustment = (
    productId: string,
    locationId: string,
    adjustedQty: number,
    reason: StockAdjustmentRequest['reasonCode'],
    notes: string
  ) => {
    if (!can('inventory:adjust_request')) {
      soundFX.playScanError();
      return { success: false, message: `Access Denied: Role "${currentUser.role}" cannot request stock adjustments.` };
    }

    const currentStockItem = inventoryStock.find(s => s.productId === productId && s.locationId === locationId);
    const prevQty = currentStockItem ? currentStockItem.quantity : 0;
    const diff = adjustedQty - prevQty;

    const newAdj: StockAdjustmentRequest = {
      id: `adj-${Date.now()}`,
      warehouseId: activeWarehouseId,
      productId,
      locationId,
      requestedByUserId: currentUser.id,
      requestedByUserName: `${currentUser.name} (${currentUser.role})`,
      requestedDate: new Date().toISOString(),
      previousQty: prevQty,
      adjustedQty,
      differenceQty: diff,
      reasonCode: reason,
      notes,
      status: 'PENDING_SUPERVISOR_APPROVAL'
    };

    setAdjustments(prev => [newAdj, ...prev]);

    appendAuditLog(
      'STOCK_ADJUSTMENT_REQUESTED',
      'inventory',
      `Discrepancy adjustment requested by ${currentUser.name}: ${diff > 0 ? '+' : ''}${diff} units of ${productId}. Awaiting Supervisor Approval.`,
      newAdj.id,
      newAdj
    );

    soundFX.playScanSuccess();
    return { success: true, message: `Stock adjustment request submitted. Under RBAC rules, this requires Supervisor sign-off.` };
  };

  const approveAdjustment = (adjustmentId: string, approve: boolean, notes?: string) => {
    // CRITICAL RBAC CHECK: Officer CANNOT approve adjustments! Supervisor or Admin required!
    if (!can('inventory:adjust_approve')) {
      soundFX.playScanError();
      return {
        success: false,
        message: `RBAC SECURITY VIOLATION: Role "${currentUser.role}" (${currentUser.name}) is NOT authorized to approve stock adjustments! Only Warehouse Supervisor or Admin can approve discrepancies.`
      };
    }

    const adj = adjustments.find(a => a.id === adjustmentId);
    if (!adj) return { success: false, message: 'Adjustment request not found.' };

    if (!approve) {
      setAdjustments(prev => prev.map(a => a.id === adjustmentId ? {
        ...a,
        status: 'REJECTED',
        rejectionReason: notes || 'Discrepancy rejected by supervisor after recount.',
        approvedByUserId: currentUser.id,
        approvedByUserName: currentUser.name,
        approvalDate: new Date().toISOString()
      } : a));

      appendAuditLog(
        'STOCK_ADJUSTMENT_REJECTED',
        'inventory',
        `Stock adjustment #${adjustmentId} REJECTED by Supervisor ${currentUser.name}. Reason: ${notes || 'Recount failed.'}`,
        adjustmentId
      );

      soundFX.playScanSuccess();
      return { success: true, message: `Stock adjustment rejected.` };
    }

    // Apply stock adjustment to inventory
    setAdjustments(prev => prev.map(a => a.id === adjustmentId ? {
      ...a,
      status: 'APPROVED',
      approvedByUserId: currentUser.id,
      approvedByUserName: currentUser.name,
      approvalDate: new Date().toISOString()
    } : a));

    setInventoryStock(prev => {
      const match = prev.find(s => s.productId === adj.productId && s.locationId === adj.locationId);
      if (match) {
        return prev.map(s => s.id === match.id ? { ...s, quantity: adj.adjustedQty } : s);
      } else {
        return [...prev, {
          id: `stk-${Date.now()}`,
          productId: adj.productId,
          warehouseId: adj.warehouseId,
          locationId: adj.locationId,
          locationCode: 'ADJUSTED-LOC',
          lotNumber: 'LOT-ADJ',
          quantity: adj.adjustedQty,
          receivedDate: new Date().toISOString().split('T')[0],
          status: 'available'
        }];
      }
    });

    // Update Product total stock
    setProducts(prev => prev.map(p => {
      if (p.id === adj.productId) {
        return { ...p, currentStock: Math.max(0, p.currentStock + adj.differenceQty) };
      }
      return p;
    }));

    appendAuditLog(
      'STOCK_ADJUSTMENT_APPROVED',
      'inventory',
      `Stock adjustment #${adjustmentId} APPROVED by Supervisor ${currentUser.name}. Quantity reconciled: delta ${adj.differenceQty > 0 ? '+' : ''}${adj.differenceQty} units.`,
      adjustmentId,
      adj
    );

    soundFX.playScanSuccess();
    return { success: true, message: `Stock adjustment approved by Supervisor. Inventory levels reconciled.` };
  };

  // PICKING WORKFLOW
  const createPickWave = (orderIds: string[]) => {
    if (!can('picking:create_wave')) {
      soundFX.playScanError();
      return { success: false, message: `Access Denied: Role "${currentUser.role}" cannot create pick waves.` };
    }

    const waveId = `wave-${Date.now()}`;
    const targetOrders = orders.filter(o => orderIds.includes(o.id));
    const totalItems = targetOrders.reduce((sum, o) => sum + o.items.reduce((acc, it) => acc + it.requestedQty, 0), 0);

    const newWave: PickWave = {
      id: waveId,
      waveNumber: `WAVE-2026-${Math.floor(100 + Math.random() * 900)}`,
      warehouseId: activeWarehouseId,
      orderIds,
      status: 'ASSIGNED',
      assignedToUserId: currentUser.id,
      assignedToUserName: currentUser.name,
      totalItems,
      pickedItems: 0,
      createdAt: new Date().toISOString()
    };

    setPickWaves(prev => [newWave, ...prev]);
    setOrders(prev => prev.map(o => orderIds.includes(o.id) ? { ...o, status: 'PICKING', waveId } : o));

    appendAuditLog(
      'PICK_WAVE_DISPATCHED',
      'picking',
      `Pick Wave ${newWave.waveNumber} generated for ${orderIds.length} orders (${totalItems} total items) by ${currentUser.name}.`,
      waveId,
      { waveNumber: newWave.waveNumber, orderIds }
    );

    soundFX.playScanSuccess();
    return { success: true, message: `Pick wave created with ${orderIds.length} orders.` };
  };

  const completePickItem = (orderId: string, productId: string, pickedQty: number) => {
    if (!can('picking:execute')) {
      soundFX.playScanError();
      return { success: false, message: `Access Denied: Role "${currentUser.role}" cannot execute picks.` };
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const updatedOrders = orders.map(o => {
      if (o.id !== orderId) return o;
      const updatedItems = o.items.map(it => {
        if (it.productId === productId) {
          return { ...it, pickedQty };
        }
        return it;
      });
      const allPicked = updatedItems.every(it => it.pickedQty >= it.requestedQty);
      return {
        ...o,
        items: updatedItems,
        status: allPicked ? ('PICKED' as const) : ('PICKING' as const)
      };
    });

    setOrders(updatedOrders);

    // Update active wave count
    if (order.waveId) {
      setPickWaves(prev => prev.map(w => {
        if (w.id !== order.waveId) return w;
        const newPicked = w.pickedItems + pickedQty;
        return {
          ...w,
          pickedItems: newPicked,
          status: newPicked >= w.totalItems ? 'COMPLETED' : 'PICKING'
        };
      }));
    }

    appendAuditLog(
      'ITEM_PICKED_VERIFIED',
      'picking',
      `Item ${productId} (Qty: ${pickedQty}) scanned and verified for Order ${order.orderNumber} by ${currentUser.name}.`,
      orderId
    );

    soundFX.playScanSuccess();
    return { success: true, message: `Item pick verified!` };
  };

  // DISPATCH & PACKING WORKFLOW
  const packAndDispatchShipment = (
    orderId: string,
    carrier: DispatchShipment['carrier'],
    packageType: DispatchShipment['packageType'],
    weightKg: number
  ) => {
    if (!can('dispatch:ship')) {
      soundFX.playScanError();
      return { success: false, message: `Access Denied: Role "${currentUser.role}" cannot ship outbound cargo.`, trackingNumber: '' };
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.', trackingNumber: '' };

    const trackingNumber = `${carrier.substring(0, 3).toUpperCase()}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const bolNumber = `BOL-APX-${Date.now().toString().slice(-6)}`;
    const shipmentNumber = `DSP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newShipment: DispatchShipment = {
      id: `dsp-${Date.now()}`,
      shipmentNumber,
      orderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      warehouseId: activeWarehouseId,
      carrier,
      trackingNumber,
      packageType,
      weightKg,
      boxCount: 1,
      shippingAddress: order.destinationAddress,
      bolNumber,
      dispatchedAt: new Date().toISOString(),
      dispatchedByUserName: currentUser.name,
      status: 'DISPATCHED'
    };

    setShipments(prev => [newShipment, ...prev]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'DISPATCHED' } : o));

    appendAuditLog(
      'OUTBOUND_DISPATCH_COMPLETED',
      'dispatch',
      `Order ${order.orderNumber} packaged and handed over to carrier ${carrier}. Tracking: ${trackingNumber}, BOL: ${bolNumber}.`,
      newShipment.id,
      { trackingNumber, carrier, bolNumber }
    );

    soundFX.playDispatchCelebration();
    return { success: true, message: `Order successfully dispatched! Bill of Lading ${bolNumber} generated.`, trackingNumber };
  };

  // RETURNS MANAGEMENT (RMA)
  const processReturnRMA = (rmaId: string, items: ReturnOrder['items']) => {
    if (!can('returns:inspect')) {
      soundFX.playScanError();
      return { success: false, message: `Access Denied: Role "${currentUser.role}" cannot inspect returns.` };
    }

    setReturns(prev => prev.map(r => {
      if (r.id !== rmaId) return r;
      return {
        ...r,
        status: 'COMPLETED',
        items,
        inspectedByUserName: currentUser.name,
        completedAt: new Date().toISOString()
      };
    }));

    // For items marked RESTOCK_TO_INVENTORY, create putaway task
    items.forEach(it => {
      if (it.disposition === 'RESTOCK_TO_INVENTORY') {
        const taskId = `put-ret-${Date.now()}`;
        setPutawayTasks(tasks => [{
          id: taskId,
          receiptId: rmaId,
          receiptNumber: `RMA-RESTOCK`,
          productId: it.productId,
          warehouseId: activeWarehouseId,
          fromLocationId: 'LOC-QUA-Q01-01',
          suggestedLocationId: 'LOC-PCK-A01-03',
          quantity: it.quantity,
          lotNumber: 'LOT-RMA-RESTOCK',
          status: 'PENDING',
          assignedToUserId: currentUser.id,
          assignedToUserName: currentUser.name
        }, ...tasks]);
      } else if (it.disposition === 'MOVE_TO_QUARANTINE') {
        // add to quarantine
        setInventoryStock(stk => [...stk, {
          id: `stk-qua-${Date.now()}`,
          productId: it.productId,
          warehouseId: activeWarehouseId,
          locationId: 'LOC-QUA-Q01-01',
          locationCode: 'QUA-Q01-R01-H01',
          lotNumber: 'LOT-RMA-QUARANTINE',
          quantity: it.quantity,
          receivedDate: new Date().toISOString().split('T')[0],
          status: 'quarantined'
        }]);
      }
    });

    appendAuditLog(
      'RETURN_RMA_PROCESSED',
      'returns',
      `RMA #${rmaId} inspected and graded by ${currentUser.name}. Disposition executed across ${items.length} return lines.`,
      rmaId,
      { items }
    );

    soundFX.playScanSuccess();
    return { success: true, message: `RMA processed and inventory disposition routed.` };
  };

  // BIN TRANSFER
  const transferStockBetweenBins = (stockId: string, targetLocationId: string, qty: number) => {
    const item = inventoryStock.find(s => s.id === stockId);
    if (!item) return { success: false, message: 'Stock line not found.' };
    if (qty > item.quantity) return { success: false, message: 'Quantity exceeds available stock.' };

    const loc = activeWarehouse.locations.find(l => l.id === targetLocationId);
    const locCode = loc ? `${loc.zone.substring(0, 3).toUpperCase()}-${loc.aisle}-${loc.rack}-${loc.bin}` : targetLocationId;

    setInventoryStock(prev => {
      const remaining = item.quantity - qty;
      const filtered = remaining <= 0 ? prev.filter(s => s.id !== stockId) : prev.map(s => s.id === stockId ? { ...s, quantity: remaining } : s);
      return [...filtered, {
        id: `stk-${Date.now()}`,
        productId: item.productId,
        warehouseId: item.warehouseId,
        locationId: targetLocationId,
        locationCode: locCode,
        lotNumber: item.lotNumber,
        quantity: qty,
        receivedDate: item.receivedDate,
        status: item.status
      }];
    });

    appendAuditLog(
      'STOCK_BIN_TRANSFERRED',
      'inventory',
      `Transferred ${qty} units of ${item.productId} from ${item.locationCode} to ${locCode} by ${currentUser.name}.`,
      stockId
    );

    soundFX.playScanSuccess();
    return { success: true, message: `Transferred ${qty} units to ${locCode}.` };
  };

  // ADD NEW ENTITIES
  const addNewLocation = (location: StorageLocation) => {
    setWarehouses(prev => prev.map(w => {
      if (w.id !== location.warehouseId) return w;
      return { ...w, locations: [...w.locations, location] };
    }));
    appendAuditLog('LOCATION_CREATED', 'company', `New storage location ${location.barcode} created in Zone ${location.zone}.`, location.id);
  };

  const addNewProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    appendAuditLog('PRODUCT_CATALOG_CREATED', 'inventory', `New SKU ${product.sku} (${product.name}) added to product catalog.`, product.id);
  };

  const addNewWarehouse = (warehouse: Warehouse) => {
    if (!can('warehouse:manage')) {
      return;
    }
    setWarehouses(prev => [...prev, warehouse]);
    appendAuditLog('WAREHOUSE_FACILITY_ADDED', 'company', `New warehouse facility ${warehouse.name} (${warehouse.code}) registered.`, warehouse.id);
  };

  const addNewUser = (user: User) => {
    if (!can('users:manage')) {
      return;
    }
    setUsers(prev => [...prev, user]);
    appendAuditLog('USER_INVITED', 'users', `User ${user.name} (${user.email}) added with role "${user.role}".`, user.id);
  };

  const updateCompanyPlan = (planId: 'starter' | 'growth' | 'enterprise') => {
    if (!can('billing:manage')) {
      return;
    }
    setCompany(prev => ({
      ...prev,
      subscriptionPlanId: planId,
      maxWarehouses: planId === 'starter' ? 1 : planId === 'growth' ? 3 : 10,
      maxUsers: planId === 'starter' ? 5 : planId === 'growth' ? 20 : 100
    }));
    appendAuditLog('SUBSCRIPTION_TIER_CHANGED', 'billing', `Company subscription tier updated to ${planId.toUpperCase()} by ${currentUser.name}.`, company.id);
  };

  // CRYPTOGRAPHIC AUDIT LEDGER INTEGRITY VERIFICATION
  const verifyAuditIntegrity = () => {
    let prevHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    for (let i = 0; i < auditLogs.length; i++) {
      const block = auditLogs[i];
      if (block.previousHash !== prevHash) {
        return { isValid: false, checkedBlocks: i, brokenBlockNumber: block.blockNumber };
      }
      const calculatedHash = computeBlockHashSync(prevHash, block.action, block.timestamp, block.actorName);
      if (calculatedHash !== block.hash) {
        return { isValid: false, checkedBlocks: i, brokenBlockNumber: block.blockNumber };
      }
      prevHash = block.hash;
    }

    appendAuditLog(
      'CRYPTOGRAPHIC_LEDGER_VERIFIED',
      'audit',
      `Audit ledger integrity verified across all ${auditLogs.length} blocks. Cryptographic hash chain 100% valid and untampered.`,
      'audit-chain'
    );

    return { isValid: true, checkedBlocks: auditLogs.length };
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setCompany(INITIAL_COMPANY);
    setBranches(INITIAL_BRANCHES);
    setWarehouses(INITIAL_WAREHOUSES);
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setInventoryStock(INITIAL_INVENTORY_STOCK);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setReceipts(INITIAL_INBOUND_RECEIPTS);
    setPutawayTasks(INITIAL_PUTAWAY_TASKS);
    setOrders(INITIAL_OUTBOUND_ORDERS);
    setPickWaves(INITIAL_PICK_WAVES);
    setShipments(INITIAL_DISPATCH_SHIPMENTS);
    setReturns(INITIAL_RETURNS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserId('usr-off');
    setActiveWarehouseId('wh-los-01');
    soundFX.playScanSuccess();
  };

  return (
    <WarehouseContext.Provider
      value={{
        currentUser,
        switchUser,
        activeWarehouseId,
        setActiveWarehouseId,
        activeWarehouse,
        company,
        branches,
        warehouses,
        users,
        products,
        inventoryStock,
        adjustments,
        receipts,
        putawayTasks,
        orders,
        pickWaves,
        shipments,
        returns,
        auditLogs,
        can,
        receiveInboundShipment,
        completePutaway,
        requestAdjustment,
        approveAdjustment,
        createPickWave,
        completePickItem,
        packAndDispatchShipment,
        processReturnRMA,
        transferStockBetweenBins,
        addNewLocation,
        addNewProduct,
        addNewWarehouse,
        addNewUser,
        updateCompanyPlan,
        verifyAuditIntegrity,
        resetToDemoData
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
