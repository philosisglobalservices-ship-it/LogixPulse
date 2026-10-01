import React, { useState, useRef, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { ROLE_LABELS } from '../../services/rbac';
import { NavTab } from './Sidebar';
import { 
  Boxes, 
  Scan, 
  Warehouse as WarehouseIcon, 
  ChevronDown, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Bell, 
  Sparkles,
  UserCheck,
  Database,
  X,
  AlertTriangle,
  ArrowDownToLine,
  Package,
  ArrowRight,
  CheckCheck,
  Layers,
  Clock
} from 'lucide-react';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenSupabase: () => void;
  onNavigate?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenScanner, onOpenSupabase, onNavigate }) => {
  const { 
    currentUser, 
    switchUser, 
    users, 
    warehouses, 
    activeWarehouseId, 
    setActiveWarehouseId,
    adjustments,
    receipts,
    products,
    pickWaves,
    returns,
    auditLogs,
    resetToDemoData 
  } = useWarehouse();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [warehouseMenuOpen, setWarehouseMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'all' | 'approvals' | 'stock' | 'operations'>('all');

  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  // Construct active operational notifications
  interface NotificationItem {
    id: string;
    category: 'approval' | 'stock' | 'inbound' | 'picking' | 'returns' | 'audit';
    filterGroup: 'approvals' | 'stock' | 'operations';
    title: string;
    description: string;
    timestamp: string;
    targetTab: NavTab;
    actionLabel: string;
    priority: 'critical' | 'high' | 'medium' | 'info';
    badge: string;
    badgeColor: string;
    icon: React.ReactNode;
  }

  const generatedNotifications: NotificationItem[] = [
    // 1. Pending Approvals
    ...adjustments
      .filter(a => a.status === 'PENDING_SUPERVISOR_APPROVAL')
      .map(a => ({
        id: `adj-${a.id}`,
        category: 'approval' as const,
        filterGroup: 'approvals' as const,
        title: 'Stock Adjustment Discrepancy Approval',
        description: `${a.requestedByUserName} requested variance adjustment (${a.differenceQty > 0 ? '+' : ''}${a.differenceQty} units) on product lot. Reason: "${a.reasonCode}".`,
        timestamp: new Date(a.requestedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetTab: 'inventory' as NavTab,
        actionLabel: 'Review Discrepancy',
        priority: 'critical' as const,
        badge: 'Supervisor Review',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: <ShieldAlert className="w-4 h-4 text-amber-400" />
      })),

    // 2. Low Stock Alerts
    ...products
      .filter(p => p.currentStock <= p.reorderPoint)
      .map(p => ({
        id: `stock-${p.id}`,
        category: 'stock' as const,
        filterGroup: 'stock' as const,
        title: `Low Stock Alert: ${p.name}`,
        description: `Current balance (${p.currentStock} ${p.unit}) is below reorder threshold (${p.reorderPoint} ${p.unit}). Warehouse replenishment needed.`,
        timestamp: 'Critical Alert',
        targetTab: 'inventory' as NavTab,
        actionLabel: 'View Inventory',
        priority: 'high' as const,
        badge: 'Reorder Level',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        icon: <AlertTriangle className="w-4 h-4 text-rose-400" />
      })),

    // 3. Inbound Arrived POs
    ...receipts
      .filter(r => r.status === 'ARRIVED')
      .map(r => ({
        id: `rcpt-${r.id}`,
        category: 'inbound' as const,
        filterGroup: 'operations' as const,
        title: `Inbound PO Docked: ${r.receiptNumber}`,
        description: `${r.supplierName} delivery (${r.poNumber}) has docked at Gate 3. Awaiting barcode scan and put-away generation.`,
        timestamp: r.expectedArrivalDate || 'Docked Today',
        targetTab: 'receiving' as NavTab,
        actionLabel: 'Process Inbound',
        priority: 'high' as const,
        badge: 'Inbound PO',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        icon: <ArrowDownToLine className="w-4 h-4 text-sky-400" />
      })),

    // 4. Wave Picking Active
    ...pickWaves
      .filter(w => w.status === 'CREATED' || w.status === 'ASSIGNED' || w.status === 'PICKING')
      .map(w => ({
        id: `wave-${w.id}`,
        category: 'picking' as const,
        filterGroup: 'operations' as const,
        title: `Pick Wave Active: ${w.waveNumber}`,
        description: `${w.pickedItems} of ${w.totalItems} items picked across ${w.orderIds.length} orders. Assignee: ${w.assignedToUserName || 'Tunde Balogun'}.`,
        timestamp: 'Active Wave',
        targetTab: 'picking' as NavTab,
        actionLabel: 'Open Wave Pick',
        priority: 'medium' as const,
        badge: 'Wave Picking',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: <Package className="w-4 h-4 text-purple-400" />
      })),

    // 5. RMA Returns
    ...returns
      .filter(ret => ret.status === 'PENDING_RECEIPT' || ret.status === 'INSPECTION')
      .map(ret => ({
        id: `ret-${ret.id}`,
        category: 'returns' as const,
        filterGroup: 'operations' as const,
        title: `RMA Awaiting QA Inspection: ${ret.rmaNumber}`,
        description: `Customer ${ret.customerName} returned items (Reason: ${ret.returnReason}). QA disposition pending.`,
        timestamp: 'Triage Pending',
        targetTab: 'returns' as NavTab,
        actionLabel: 'Inspect RMA',
        priority: 'medium' as const,
        badge: 'Reverse Logistics',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        icon: <RotateCcw className="w-4 h-4 text-indigo-400" />
      })),

    // 6. Cryptographic Audit Seal
    ...(auditLogs.length > 0 ? [{
      id: `audit-${auditLogs[auditLogs.length - 1].blockNumber}`,
      category: 'audit' as const,
      filterGroup: 'operations' as const,
      title: `SHA-256 Merkle Block #${auditLogs[auditLogs.length - 1].blockNumber} Verified`,
      description: `${auditLogs[auditLogs.length - 1].actorName} performed ${auditLogs[auditLogs.length - 1].action} on ${auditLogs[auditLogs.length - 1].module}. Cryptographic integrity intact.`,
      timestamp: new Date(auditLogs[auditLogs.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      targetTab: 'audit' as NavTab,
      actionLabel: 'Verify Ledger',
      priority: 'info' as const,
      badge: 'Audit Seal',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
    }] : [])
  ];

  const activeNotifications = generatedNotifications.filter(n => !dismissedNotificationIds.has(n.id));
  const unreadCount = activeNotifications.filter(n => !readNotificationIds.has(n.id)).length;

  const filteredNotifications = activeNotifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.filterGroup === activeFilter;
  });

  const handleMarkAllRead = () => {
    setReadNotificationIds(new Set(activeNotifications.map(n => n.id)));
  };

  const handleClearAll = () => {
    setDismissedNotificationIds(new Set(generatedNotifications.map(n => n.id)));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setReadNotificationIds(prev => new Set(prev).add(item.id));
    if (onNavigate) {
      onNavigate(item.targetTab);
    }
    setNotificationsOpen(false);
  };

  const handleDismissItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDismissedNotificationIds(prev => new Set(prev).add(id));
  };

  const currentRoleInfo = ROLE_LABELS[currentUser.role];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-2.5 flex items-center justify-between">
      
      {/* Left: Branding & Facility Switcher */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">LogixPulse</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                Cloud WOS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise Warehouse Operating System</p>
          </div>
        </div>

        {/* Warehouse Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setWarehouseMenuOpen(!warehouseMenuOpen);
              setRoleMenuOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition"
          >
            <WarehouseIcon className="w-3.5 h-3.5 text-brand-400" />
            <span className="max-w-[150px] truncate">
              {warehouses.find(w => w.id === activeWarehouseId)?.name || 'Select Facility'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {warehouseMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-700/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Operational Warehouse
              </div>
              {warehouses.map(wh => (
                <button
                  key={wh.id}
                  onClick={() => {
                    setActiveWarehouseId(wh.id);
                    setWarehouseMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 transition ${wh.id === activeWarehouseId ? 'text-brand-300 bg-brand-500/10 font-semibold' : 'text-slate-200'}`}
                >
                  <div>
                    <p>{wh.name}</p>
                    <p className="text-[10px] text-slate-400">{wh.code} • {wh.totalAreaSqFt.toLocaleString()} sq ft</p>
                  </div>
                  {wh.id === activeWarehouseId && <Check className="w-4 h-4 text-brand-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Scanner, Role Impersonator, Notifications, Reset Demo */}
      <div className="flex items-center space-x-3">
        
        {/* Supabase Cloud Connection Button */}
        <button
          onClick={onOpenSupabase}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-emerald-500/40 text-xs font-medium text-slate-200 transition shadow-sm"
          title="Supabase Cloud PostgreSQL Database Status"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline font-mono text-[11px] text-emerald-300 font-semibold">Supabase</span>
        </button>

        {/* Quick RF Barcode Scanner Button */}
        <button
          onClick={onOpenScanner}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition transform active:scale-95"
          title="Open virtual handheld barcode scanner"
        >
          <Scan className="w-4 h-4 animate-pulse" />
          <span className="hidden sm:inline">Handheld Scanner</span>
          <kbd className="hidden md:inline px-1.5 py-0.2 rounded bg-black/30 text-[10px] font-mono">Scan</kbd>
        </button>

        {/* Active Notifications Button & Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setRoleMenuOpen(false);
              setWarehouseMenuOpen(false);
            }}
            className={`p-2 rounded-xl transition relative border ${notificationsOpen ? 'bg-brand-500/20 border-brand-500/50 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
            title="Operational Notifications & Alerts"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Center Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="p-3.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Operational Alerts
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {unreadCount} unread
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400">Live facility updates & required tasks</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-slate-700/80 transition"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center space-x-1 text-[11px] overflow-x-auto">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${activeFilter === 'all' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                  All ({activeNotifications.length})
                </button>
                <button
                  onClick={() => setActiveFilter('approvals')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${activeFilter === 'approvals' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                  Approvals
                </button>
                <button
                  onClick={() => setActiveFilter('stock')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${activeFilter === 'stock' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                  Low Stock
                </button>
                <button
                  onClick={() => setActiveFilter('operations')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${activeFilter === 'operations' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                  Operations
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/80">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-500">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-slate-300">All caught up!</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">No pending notifications in this category.</p>
                  </div>
                ) : (
                  filteredNotifications.map(item => {
                    const isUnread = !readNotificationIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3 text-left transition cursor-pointer flex items-start space-x-3 group relative ${isUnread ? 'bg-slate-800/50 hover:bg-slate-800/80' : 'hover:bg-slate-800/40 opacity-80'}`}
                      >
                        {/* Unread dot */}
                        {isUnread && (
                          <div className="absolute top-3.5 left-1.5 w-1.5 h-1.5 rounded-full bg-brand-400" />
                        )}

                        {/* Icon */}
                        <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0 mt-0.5 group-hover:border-slate-600 transition">
                          {item.icon}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-[9px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {item.timestamp}
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold leading-snug line-clamp-1 ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                            {item.title}
                          </h4>

                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-brand-400 group-hover:text-brand-300 flex items-center gap-1">
                              {item.actionLabel}
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>

                        {/* Dismiss button */}
                        <button
                          onClick={(e) => handleDismissItem(e, item.id)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded-md opacity-0 group-hover:opacity-100 transition absolute top-2 right-2"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <button
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-slate-200 transition px-2 py-1 rounded hover:bg-slate-800"
                >
                  Clear all alerts
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('audit');
                    setNotificationsOpen(false);
                  }}
                  className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-brand-500/10 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  View Audit Trail
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm('Reset entire system state back to pristine factory demo data?')) {
              resetToDemoData();
            }
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          title="Reset to factory demo data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Live RBAC User & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-lg object-cover ring-2 ring-brand-500/40"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {currentUser.name}
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${currentRoleInfo.badge}`}>
                  {currentRoleInfo.title}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-700/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <UserCheck className="w-4 h-4 text-brand-400" />
                  Role Persona Switcher (RBAC Demo)
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Switch user to test exact permission boundaries defined in the docx specification.
                </p>
              </div>

              <div className="space-y-1.5 py-2">
                {users.map(u => {
                  const roleMeta = ROLE_LABELS[u.role];
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start space-x-3 ${isCurrent ? 'bg-brand-500/15 border border-brand-500/40' : 'hover:bg-slate-700/60'}`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{u.name}</span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-mono ${roleMeta.badge}`}>
                            {roleMeta.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                          {roleMeta.boundarySummary}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-400">
                <strong className="text-brand-300 block mb-1">Key Document Rule Highlight:</strong>
                Warehouse Officer can receive stock but cannot approve adjustments. Admin can manage users but cannot delete audit history.
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
