import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { ROLE_LABELS } from '../../services/rbac';
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
  Database
} from 'lucide-react';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenSupabase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenScanner, onOpenSupabase }) => {
  const { 
    currentUser, 
    switchUser, 
    users, 
    warehouses, 
    activeWarehouseId, 
    setActiveWarehouseId,
    adjustments,
    receipts,
    resetToDemoData 
  } = useWarehouse();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [warehouseMenuOpen, setWarehouseMenuOpen] = useState(false);

  const pendingAdjustments = adjustments.filter(a => a.status === 'PENDING_SUPERVISOR_APPROVAL').length;
  const pendingInbound = receipts.filter(r => r.status === 'ARRIVED').length;
  const totalNotifications = pendingAdjustments + pendingInbound;

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
            onClick={() => setWarehouseMenuOpen(!warehouseMenuOpen)}
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

      {/* Right Controls: Scanner, Role Impersonator, Reset Demo */}
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

        {/* Notifications badge */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition relative">
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {totalNotifications}
              </span>
            )}
          </button>
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
