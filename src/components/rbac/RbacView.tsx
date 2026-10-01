import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { ROLE_PERMISSIONS, ROLE_LABELS, Permission } from '../../services/rbac';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Check, 
  X, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Info, 
  UserCheck, 
  Fingerprint,
  Zap
} from 'lucide-react';
import { soundFX } from '../../utils/sound';

export const RbacView: React.FC = () => {
  const { users, currentUser, switchUser, can } = useWarehouse();
  const [simulationResult, setSimulationResult] = useState<{ action: string; allowed: boolean; reason: string } | null>(null);

  const testConstraint = (actionName: string, requiredPermission: Permission, explanationDenied: string) => {
    const allowed = can(requiredPermission);
    if (allowed) {
      soundFX.playScanSuccess();
      setSimulationResult({
        action: actionName,
        allowed: true,
        reason: `Authorized: Your current active role "${currentUser.role.toUpperCase()}" possesses the permission "${requiredPermission}".`
      });
    } else {
      soundFX.playScanError();
      setSimulationResult({
        action: actionName,
        allowed: false,
        reason: explanationDenied
      });
    }
  };

  const permissionsList: { key: Permission; label: string; module: string }[] = [
    { key: 'inventory:view', label: 'View Inventory & Stock Balances', module: 'Inventory' },
    { key: 'inventory:adjust_request', label: 'Request Stock Adjustment', module: 'Inventory' },
    { key: 'inventory:adjust_approve', label: 'APPROVE Stock Adjustment', module: 'Inventory' },
    { key: 'receiving:execute', label: 'Receive Inbound Shipments & Issue GRN', module: 'Inbound' },
    { key: 'putaway:execute', label: 'Execute Put-Away to Bins', module: 'Putaway' },
    { key: 'picking:create_wave', label: 'Create & Assign Picking Waves', module: 'Outbound' },
    { key: 'picking:execute', label: 'Scan & Pick Orders', module: 'Outbound' },
    { key: 'dispatch:ship', label: 'Generate BOL & Dispatch Shipments', module: 'Dispatch' },
    { key: 'returns:inspect', label: 'Inspect & Triage Returns (RMA)', module: 'Returns' },
    { key: 'users:manage', label: 'Create & Manage User Accounts', module: 'Administration' },
    { key: 'billing:manage', label: 'Modify Billing & Subscription Plans', module: 'Financial' },
    { key: 'audit:view', label: 'Inspect Cryptographic Audit Trail', module: 'Audit' },
    { key: 'audit:verify', label: 'Run Merkle Hash Chain Verification', module: 'Audit' },
    { key: 'audit:delete', label: 'Delete or Modify Historical Transactions', module: 'Security' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                FIRST-CLASS DIFFERENTIATOR
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-400" />
              Role-Based Access Control (RBAC) & Governance
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Strict separation of duties prevents unauthorized stock adjustments, prevents financial tampering, and enforces complete accountability across every warehouse transaction.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Current Active Persona</span>
              <p className="text-xs font-bold text-white">{currentUser.name}</p>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${ROLE_LABELS[currentUser.role].badge}`}>
                {ROLE_LABELS[currentUser.role].title}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Document Golden Rules Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
              <Fingerprint className="w-4 h-4" />
              Warehouse Officer Boundary
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              <strong className="text-white">Can:</strong> Receive stock, scan barcodes, execute putaways & picks.<br />
              <strong className="text-rose-400">CANNOT:</strong> Approve stock adjustments or write-downs.
            </p>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Fingerprint className="w-4 h-4" />
              Warehouse Supervisor Boundary
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              <strong className="text-white">Can:</strong> Approve inventory count discrepancies & wave picks.<br />
              <strong className="text-rose-400">CANNOT:</strong> Modify corporate billing, plans or financial settings.
            </p>
          </div>

          <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
              <Fingerprint className="w-4 h-4" />
              Administrator Boundary
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              <strong className="text-white">Can:</strong> Manage users, configure facilities & subscription.<br />
              <strong className="text-rose-400">CANNOT:</strong> Secretly delete or tamper with transaction history.
            </p>
          </div>

        </div>
      </div>

      {/* Live Interactive Boundary Simulation Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Interactive Security Boundary Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test whether your active persona (<strong className="text-brand-300">{currentUser.name}</strong> as <span className="capitalize">{currentUser.role}</span>) can trigger the following high-privilege operations:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <button
            onClick={() => testConstraint(
              'Approve Stock Discrepancy Adjustment',
              'inventory:adjust_approve',
              `DENIED: Warehouse Officer cannot approve inventory adjustments. Only Warehouse Supervisor or Admin can authorize discrepancies.`
            )}
            className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-brand-500/50 rounded-xl text-left transition group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-brand-300">
                1. Approve Stock Adjustment
              </span>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Test the Officer vs Supervisor boundary specified in the document.
            </p>
          </button>

          <button
            onClick={() => testConstraint(
              'Change Corporate Billing & Subscription',
              'billing:manage',
              `DENIED: Warehouse Supervisor cannot alter financial or billing settings. Restricted to Company Admin.`
            )}
            className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-brand-500/50 rounded-xl text-left transition group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-brand-300">
                2. Alter Financial / Billing
              </span>
              <Lock className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Test whether non-admins can modify subscription or billing tiers.
            </p>
          </button>

          <button
            onClick={() => testConstraint(
              'Delete Audit Trail History',
              'audit:delete',
              `HARD ENFORCEMENT: Even Administrator CANNOT delete or tamper with transaction history! The cryptographic SHA-256 ledger is strictly append-only.`
            )}
            className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-brand-500/50 rounded-xl text-left transition group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-brand-300">
                3. Delete Historical Audit Records
              </span>
              <Lock className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-[11px] text-slate-400">
              Verify immutable audit integrity protection required by document.
            </p>
          </button>

        </div>

        {/* Simulation Output Banner */}
        {simulationResult && (
          <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
            simulationResult.allowed
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {simulationResult.allowed ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="block font-bold text-sm mb-0.5">
                {simulationResult.action}: {simulationResult.allowed ? 'ACTION PERMITTED' : 'ACCESS DENIED BY RBAC GATE'}
              </strong>
              <p className="text-slate-200">{simulationResult.reason}</p>
            </div>
          </div>
        )}
      </div>

      {/* Full Permissions Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">RBAC Permissions Matrix by Role</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="py-3 px-4">Permission Name & Scope</th>
                <th className="py-3 px-3 text-center text-rose-300">Admin</th>
                <th className="py-3 px-3 text-center text-amber-300">Supervisor</th>
                <th className="py-3 px-3 text-center text-blue-300">Officer</th>
                <th className="py-3 px-3 text-center text-emerald-300">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {permissionsList.map((perm) => {
                const adminHas = ROLE_PERMISSIONS['admin'].includes(perm.key);
                const supHas = ROLE_PERMISSIONS['supervisor'].includes(perm.key);
                const offHas = ROLE_PERMISSIONS['officer'].includes(perm.key);
                const audHas = ROLE_PERMISSIONS['auditor'].includes(perm.key);

                return (
                  <tr key={perm.key} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-white">{perm.label}</div>
                      <div className="text-[10px] font-mono text-slate-500">{perm.key} • {perm.module}</div>
                    </td>
                    
                    <td className="py-2.5 px-3 text-center">
                      {adminHas ? (
                        <span className="inline-flex p-1 rounded-md bg-rose-500/20 text-rose-300"><Check className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="inline-flex p-1 rounded-md bg-slate-800 text-slate-500"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {supHas ? (
                        <span className="inline-flex p-1 rounded-md bg-amber-500/20 text-amber-300"><Check className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="inline-flex p-1 rounded-md bg-slate-800 text-slate-500"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {offHas ? (
                        <span className="inline-flex p-1 rounded-md bg-blue-500/20 text-blue-300"><Check className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="inline-flex p-1 rounded-md bg-slate-800 text-slate-500"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {audHas ? (
                        <span className="inline-flex p-1 rounded-md bg-emerald-500/20 text-emerald-300"><Check className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="inline-flex p-1 rounded-md bg-slate-800 text-slate-500"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            Registered Warehouse Users & Operators ({users.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map(u => {
            const roleInfo = ROLE_LABELS[u.role];
            const isMe = u.id === currentUser.id;
            return (
              <div key={u.id} className={`p-4 rounded-xl border flex flex-col justify-between ${isMe ? 'bg-brand-500/10 border-brand-500/40' : 'bg-slate-800/50 border-slate-700/60'}`}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{u.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{u.email}</p>
                    </div>
                  </div>

                  <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border ${roleInfo.badge}`}>
                    {roleInfo.title}
                  </span>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {roleInfo.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Status: Active</span>
                  <button
                    onClick={() => switchUser(u.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${isMe ? 'bg-brand-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                  >
                    {isMe ? 'Active' : 'Impersonate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
