import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { SUBSCRIPTION_PLANS } from '../../services/seedData';
import { 
  CreditCard, 
  Check, 
  Zap, 
  Building2, 
  Users, 
  Scan, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Lock
} from 'lucide-react';
import { soundFX } from '../../utils/sound';

export const BillingView: React.FC = () => {
  const { company, warehouses, users, updateCompanyPlan, currentUser, can } = useWarehouse();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === company.subscriptionPlanId) || SUBSCRIPTION_PLANS[1];

  const handleSelectPlan = (planId: 'starter' | 'growth' | 'enterprise') => {
    // Check RBAC permission for billing
    if (!can('billing:manage')) {
      soundFX.playScanError();
      setFeedback({
        success: false,
        message: `RBAC RESTRICTION: Role "${currentUser.role}" (${currentUser.name}) is NOT authorized to modify corporate billing or subscription tiers! Only Administrator (Dr. Folashade Adeyemi) has financial rights.`
      });
      return;
    }

    updateCompanyPlan(planId);
    soundFX.playScanSuccess();
    setFeedback({
      success: true,
      message: `Successfully updated corporate subscription to ${planId.toUpperCase()} tier! Quotas updated.`
    });
  };

  const whUsagePct = Math.round((warehouses.length / company.maxWarehouses) * 100);
  const userUsagePct = Math.round((users.length / company.maxUsers) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                SAAS BUSINESS MODEL
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-brand-400" />
              SaaS Subscription & Multi-Tenant Billing
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Monthly subscription tier billed per warehouse facility and active user seat. Includes live quota metering and strict financial access control.
            </p>
          </div>

          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 text-right">
            <span className="text-[10px] text-slate-400 font-mono block">CURRENT ACTIVE TIER</span>
            <span className="text-base font-extrabold text-brand-300">{currentPlan.name}</span>
            <span className="text-xs font-mono text-slate-400 block">₦{currentPlan.priceMonthlyUsd.toLocaleString()}/month</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>RBAC Security Note:</strong> Warehouse Supervisor can approve stock adjustments, but <em>cannot change financial/billing settings</em>.
          </span>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
          feedback.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <ShieldAlert className="w-5 h-5 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Quota Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand-400" /> Warehouse Facilities
            </span>
            <span className="font-mono text-xs font-bold text-white">
              {warehouses.length} / {company.maxWarehouses}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, whUsagePct)}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">{company.maxWarehouses - warehouses.length} facility slots remaining</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> User Seat Licenses
            </span>
            <span className="font-mono text-xs font-bold text-white">
              {users.length} / {company.maxUsers}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, userUsagePct)}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">{company.maxUsers - users.length} user seats available</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scan className="w-4 h-4 text-emerald-400" /> Monthly Scan Events
            </span>
            <span className="font-mono text-xs font-bold text-white">
              4,820 / {currentPlan.monthlyScansQuota.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '19%' }} />
          </div>
          <p className="text-[11px] text-slate-400">19% of monthly high-speed API quota consumed</p>
        </div>

      </div>

      {/* Subscription Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map(plan => {
          const isCurrent = plan.id === company.subscriptionPlanId;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 border transition flex flex-col justify-between relative shadow-xl ${
                isCurrent
                  ? 'bg-slate-900 border-brand-500 ring-2 ring-brand-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white font-mono text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                  Current Active Plan
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-black text-white font-mono">₦{plan.priceMonthlyUsd.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 ml-1">/ month</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Warehouses:</span>
                    <span className="font-bold font-mono text-white">{plan.maxWarehouses} Facilities</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">User Seats:</span>
                    <span className="font-bold font-mono text-white">{plan.maxUsers} Users</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Scans:</span>
                    <span className="font-bold font-mono text-white">{plan.monthlyScansQuota.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Features:</span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
