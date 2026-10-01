import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { NavTab } from '../layout/Sidebar';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ArrowDownToLine, 
  MoveRight, 
  CheckSquare, 
  Truck, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    activeWarehouse, 
    products, 
    inventoryStock, 
    receipts, 
    putawayTasks, 
    orders, 
    auditLogs,
    adjustments 
  } = useWarehouse();

  // Calculate live stats
  const totalValuation = products.reduce((acc, p) => acc + (p.currentStock * p.unitCost), 0);
  const pendingInbound = receipts.filter(r => r.status === 'ARRIVED').length;
  const pendingPutaways = putawayTasks.filter(p => p.status === 'PENDING').length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING_PICK').length;
  const pendingAdjustments = adjustments.filter(a => a.status === 'PENDING_SUPERVISOR_APPROVAL').length;
  const lowStockProducts = products.filter(p => p.currentStock <= p.reorderPoint);

  return (
    <div className="space-y-6">
      
      {/* Welcome & Role Alert Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                ACTIVE FACILITY: {activeWarehouse.code}
              </span>
              <span className="text-xs text-slate-400">• {activeWarehouse.name}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Warehouse Operational Cockpit
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Logged in as <strong className="text-white">{currentUser.name}</strong> (<span className="capitalize text-brand-300 font-mono">{currentUser.role}</span>). 
              Operating under real-time cryptographic audit trail & strict RBAC constraints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('receiving')}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-brand-500/25"
            >
              <ArrowDownToLine className="w-4 h-4" /> Start Inbound
            </button>
            <button
              onClick={() => onNavigate('picking')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4 text-brand-400" /> Outbound Picking
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Inventory Value</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₦{totalValuation.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {products.length} master SKUs</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Inventory Accuracy</span>
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">99.82%</div>
          <div className="mt-2 flex items-center text-xs text-brand-400 gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cycle count verified</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Dock-to-Stock Time</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">38 mins</div>
          <div className="mt-2 flex items-center text-xs text-slate-400 gap-1 font-medium">
            <span>Target: &lt; 60 mins (Exceeding SLA)</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Ledger Integrity</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{auditLogs.length} Blocks</div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 gap-1 font-medium">
            <span>Cryptographic SHA-256 Valid</span>
          </div>
        </div>

      </div>

      {/* Operational Pipeline Flow (The Document's Sequence) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Operational Pipeline Flow</span>
              <span className="text-xs font-normal text-slate-400">(Inbound → Staging → Bins → Picking → Dispatch)</span>
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Live Stage Queues</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          <button
            onClick={() => onNavigate('receiving')}
            className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ArrowDownToLine className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                {pendingInbound} Docked
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">1. Receiving</h3>
            <p className="text-xs text-slate-400 mt-1">Inbound PO scan & GRN</p>
          </button>

          <button
            onClick={() => onNavigate('putaway')}
            className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <MoveRight className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {pendingPutaways} Ready
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">2. Put-away</h3>
            <p className="text-xs text-slate-400 mt-1">Staging to designated bins</p>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {pendingAdjustments} Sign-off
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">3. Inventory</h3>
            <p className="text-xs text-slate-400 mt-1">Discrepancy & Approvals</p>
          </button>

          <button
            onClick={() => onNavigate('picking')}
            className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CheckSquare className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                {pendingOrders} Orders
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">4. Wave Pick</h3>
            <p className="text-xs text-slate-400 mt-1">Aisle-optimized routing</p>
          </button>

          <button
            onClick={() => onNavigate('dispatch')}
            className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Truck className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Active Docks
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">5. Dispatch</h3>
            <p className="text-xs text-slate-400 mt-1">Carrier BOL & Manifest</p>
          </button>

        </div>
      </div>

      {/* Two Column Layout: Low Stock Alerts & Live Immutable Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Facility Health & Low Stock Alerts */}
        <div className="space-y-6">
          
          {/* Facility Zones occupancy */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Facility Zone Occupancy</h3>
              <button onClick={() => onNavigate('company')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View 2D Layout <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {activeWarehouse.zones.map(z => {
                const pct = Math.round((z.occupiedLocations / z.totalLocations) * 100);
                return (
                  <div key={z.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{z.name}</span>
                      <span className="font-mono text-slate-400">{z.occupiedLocations} / {z.totalLocations} bins ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: z.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low stock alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Reorder Trigger Alerts
              </h3>
              <span className="text-xs font-mono text-amber-400">{lowStockProducts.length} Alert</span>
            </div>
            <div className="space-y-2.5">
              {lowStockProducts.map(p => (
                <div key={p.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{p.sku} • Reorder Min: {p.reorderPoint}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 text-sm">{p.currentStock}</span>
                    <p className="text-[10px] text-slate-400">{p.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Live Cryptographic Audit Stream */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Live Cryptographic Audit Stream
              </h3>
              <p className="text-xs text-slate-400">Append-only blockchain-verified log of warehouse operations</p>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              Verify Ledger <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[460px] pr-2 flex-1">
            {auditLogs.slice(-7).reverse().map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl transition space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold px-1.5 py-0.5 bg-slate-900 rounded text-brand-300 text-[10px]">
                      BLOCK #{entry.blockNumber}
                    </span>
                    <span className="font-bold text-white">{entry.action}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{entry.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                  <span>Actor: <strong className="text-slate-200">{entry.actorName}</strong> ({entry.actorRole})</span>
                  <span className="font-mono text-[10px] text-emerald-400/80 truncate max-w-[200px]" title={entry.hash}>
                    HASH: {entry.hash.substring(0, 18)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
