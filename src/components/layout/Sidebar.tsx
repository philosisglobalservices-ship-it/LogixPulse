import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  ShieldCheck, 
  Package, 
  ArrowDownToLine, 
  MoveRight, 
  CheckSquare, 
  Truck, 
  RotateCcw, 
  FileText, 
  CreditCard,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

export type NavTab = 
  | 'dashboard' 
  | 'company' 
  | 'rbac' 
  | 'inventory' 
  | 'receiving' 
  | 'putaway' 
  | 'picking' 
  | 'dispatch' 
  | 'returns' 
  | 'audit' 
  | 'billing';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { receipts, putawayTasks, orders, adjustments, returns, auditLogs } = useWarehouse();

  const pendingReceiving = receipts.filter(r => r.status === 'ARRIVED').length;
  const pendingPutaway = putawayTasks.filter(p => p.status === 'PENDING').length;
  const pendingPicking = orders.filter(o => o.status === 'PENDING_PICK').length;
  const pendingAdjustments = adjustments.filter(a => a.status === 'PENDING_SUPERVISOR_APPROVAL').length;
  const pendingReturns = returns.filter(r => r.status === 'INSPECTION').length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Operational Cockpit',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'company' as NavTab,
      label: 'Company & Warehouses',
      icon: Building2,
      badge: null,
      sublabel: 'Facilities, Zones & 2D Floor'
    },
    {
      id: 'rbac' as NavTab,
      label: 'Roles & Permissions',
      icon: ShieldCheck,
      badge: null,
      sublabel: 'Matrix & RBAC Guard'
    },
    {
      id: 'inventory' as NavTab,
      label: 'Inventory & Bins',
      icon: Package,
      badge: pendingAdjustments > 0 ? `${pendingAdjustments} Adj` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'receiving' as NavTab,
      label: 'Inbound Receiving',
      icon: ArrowDownToLine,
      badge: pendingReceiving > 0 ? `${pendingReceiving} Docked` : null,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      id: 'putaway' as NavTab,
      label: 'Smart Put-away',
      icon: MoveRight,
      badge: pendingPutaway > 0 ? `${pendingPutaway} Ready` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'picking' as NavTab,
      label: 'Wave Picking',
      icon: CheckSquare,
      badge: pendingPicking > 0 ? `${pendingPicking} Orders` : null,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'dispatch' as NavTab,
      label: 'Outbound Dispatch',
      icon: Truck,
      badge: null
    },
    {
      id: 'returns' as NavTab,
      label: 'Reverse Logistics (RMA)',
      icon: RotateCcw,
      badge: pendingReturns > 0 ? `${pendingReturns} Inspect` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'audit' as NavTab,
      label: 'Immutable Audit Trail',
      icon: FileText,
      badge: `${auditLogs.length} Blocks`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'billing' as NavTab,
      label: 'SaaS Subscription',
      icon: CreditCard,
      badge: 'Growth Tier',
      badgeColor: 'bg-slate-700 text-slate-300'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      
      {/* Module Title Banner */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          Core Operating Modules
        </span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'}`} />
                <div className="text-left">
                  <span>{item.label}</span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* SaaS Info Box */}
      <div className="p-3.5 m-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400 font-medium">Tenant Health</span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-emerald-400" /> 99.98% SLA
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          SHA-256 Ledger synced with append-only tamper protection.
        </p>
      </div>

    </aside>
  );
};
