import { supabase, SUPABASE_URL } from '../lib/supabase';
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
  AuditLogEntry 
} from '../types';

export interface SupabaseHealth {
  connected: boolean;
  url: string;
  latencyMs: number;
  tablesReady: boolean;
  message: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const start = performance.now();
  try {
    const { error, status } = await supabase.from('products').select('*').limit(1);
    const latency = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // Check if it is an RLS or table issue
      if (error.message.includes('row-level security') || error.message.includes('schema cache')) {
        return {
          connected: true,
          url: SUPABASE_URL,
          latencyMs: latency,
          tablesReady: false,
          message: `Connected to Supabase endpoint! (${error.message}). Run the SQL schema to complete setup.`
        };
      }
    }

    return {
      connected: true,
      url: SUPABASE_URL,
      latencyMs: latency,
      tablesReady: true,
      message: `Supabase live and operational (${latency}ms latency).`
    };
  } catch (err: any) {
    return {
      connected: false,
      url: SUPABASE_URL,
      latencyMs: 0,
      tablesReady: false,
      message: err?.message || 'Failed to reach Supabase endpoint.'
    };
  }
}

export async function pushAllToSupabase(data: {
  company: Company;
  branches: Branch[];
  warehouses: Warehouse[];
  users: User[];
  products: Product[];
  inventoryStock: InventoryItemStock[];
  receipts: InboundReceipt[];
  putawayTasks: PutawayTask[];
  orders: OutboundOrder[];
  pickWaves: PickWave[];
  shipments: DispatchShipment[];
  returns: ReturnOrder[];
  adjustments: StockAdjustmentRequest[];
  auditLogs: AuditLogEntry[];
}): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    // 1. Products
    const productPayload = data.products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      barcode: p.barcode,
      category: p.category,
      unit: p.unit,
      unit_cost: p.unitCost,
      unit_price: p.unitPrice,
      weight_kg: p.weightKg,
      reorder_point: p.reorderPoint,
      target_stock: p.targetStock,
      current_stock: p.currentStock,
      allocated_stock: p.allocatedStock,
      is_cold_chain: p.isColdChain ?? false,
      requires_lot_tracking: p.requiresLotTracking ?? true,
      image_url: p.imageUrl
    }));

    const { error: prodErr } = await supabase.from('products').upsert(productPayload);
    if (prodErr) errors.push(`Products: ${prodErr.message}`);
    else synced += productPayload.length;

    // 2. Audit logs
    const auditPayload = data.auditLogs.map(a => ({
      id: a.id,
      block_number: a.blockNumber,
      timestamp: a.timestamp,
      actor_id: a.actorId,
      actor_name: a.actorName,
      actor_role: a.actorRole,
      action: a.action,
      module: a.module,
      description: a.description,
      target_id: a.targetId,
      metadata: a.metadata,
      ip_address: a.ipAddress,
      previous_hash: a.previousHash,
      hash: a.hash
    }));

    const { error: auditErr } = await supabase.from('audit_logs').upsert(auditPayload);
    if (auditErr) errors.push(`Audit Logs: ${auditErr.message}`);
    else synced += auditPayload.length;

  } catch (e: any) {
    errors.push(e?.message || 'Sync failed');
  }

  return {
    success: errors.length === 0,
    syncedCount: synced,
    errors
  };
}
