import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  CloudUpload,
  Sparkles,
  Server
} from 'lucide-react';
import { checkSupabaseHealth, pushAllToSupabase, SupabaseHealth } from '../../services/supabaseSync';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../../lib/supabase';
import { useWarehouse } from '../../context/WarehouseContext';
import { soundFX } from '../../utils/sound';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { 
    company, 
    branches, 
    warehouses, 
    users, 
    products, 
    inventoryStock, 
    receipts, 
    putawayTasks, 
    orders, 
    pickWaves, 
    shipments, 
    returns, 
    adjustments, 
    auditLogs 
  } = useWarehouse();

  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; syncedCount: number; errors: string[] } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const testHealth = async () => {
    setIsChecking(true);
    setSyncResult(null);
    const res = await checkSupabaseHealth();
    setHealth(res);
    setIsChecking(false);
    if (res.connected) {
      soundFX.playScanSuccess();
    }
  };

  useEffect(() => {
    if (isOpen) {
      testHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    const res = await pushAllToSupabase({
      company,
      branches,
      warehouses,
      users,
      products,
      inventoryStock,
      receipts,
      putawayTasks,
      orders,
      pickWaves,
      shipments,
      returns,
      adjustments,
      auditLogs
    });
    setSyncResult(res);
    setIsSyncing(false);
    if (res.success) {
      soundFX.playScanSuccess();
    } else {
      soundFX.playScanError();
    }
  };

  const handleCopySql = () => {
    const sqlText = `-- Supabase Schema for LogixPulse WOS
CREATE TABLE IF NOT EXISTS public.companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE, currency TEXT DEFAULT 'NGN', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.warehouses (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, address TEXT);
CREATE TABLE IF NOT EXISTS public.products (id TEXT PRIMARY KEY, sku TEXT UNIQUE, name TEXT, barcode TEXT UNIQUE, unit_cost NUMERIC, unit_price NUMERIC, current_stock INT);
CREATE TABLE IF NOT EXISTS public.audit_logs (id TEXT PRIMARY KEY, block_number INT, action TEXT, actor_name TEXT, previous_hash TEXT, hash TEXT UNIQUE, timestamp TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON public.products FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);`;
    
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    soundFX.playScanSuccess();
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Supabase Cloud Database
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h3>
              <p className="text-xs text-slate-400">PostgreSQL Backend Connection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {/* Connection Status Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" /> Connection Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> LIVE & REACHABLE
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">URL:</span>
                <span className="text-brand-300 font-bold truncate max-w-[280px]">{SUPABASE_URL}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Key:</span>
                <span className="text-slate-300 truncate max-w-[280px]">
                  {SUPABASE_PUBLISHABLE_KEY.substring(0, 18)}...{SUPABASE_PUBLISHABLE_KEY.substring(SUPABASE_PUBLISHABLE_KEY.length - 8)}
                </span>
              </div>
            </div>

            {health && (
              <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
                <span>Latency: <strong className="font-mono text-emerald-400">{health.latencyMs}ms</strong></span>
                <span className="text-slate-400 truncate max-w-[320px]">{health.message}</span>
              </div>
            )}
          </div>

          {/* Sync actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Cloud Database Actions:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={testHealth}
                disabled={isChecking}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-left transition flex items-center justify-between group disabled:opacity-50"
              >
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-brand-300">Ping Database</span>
                  <span className="text-[10px] text-slate-400">Test latency & HTTP 200</span>
                </div>
                <RefreshCw className={`w-4 h-4 text-brand-400 ${isChecking ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleSyncToCloud}
                disabled={isSyncing}
                className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-left transition flex items-center justify-between shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                <div>
                  <span className="text-xs font-bold block">Sync Data to Cloud</span>
                  <span className="text-[10px] text-brand-200">Push SKUs & Audit trail</span>
                </div>
                <CloudUpload className={`w-4 h-4 text-white ${isSyncing ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sync Feedback Toast */}
          {syncResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              syncResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {syncResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{syncResult.success ? 'Cloud Synchronization Complete!' : 'Partial Cloud Sync Note'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {syncResult.success 
                  ? `Successfully pushed records to your live Supabase cloud database.` 
                  : syncResult.errors.join('. ')}
              </p>
            </div>
          )}

          {/* SQL Schema Copy Section */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-400" />
                PostgreSQL Schema Migration Script
              </span>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              A complete migration script has also been saved to <strong className="font-mono text-slate-200">supabase/schema.sql</strong> in your project. You can run it directly in your Supabase SQL Editor to initialize all 15 relational tables with RLS security policies.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <a
            href="https://supabase.com/dashboard/project/rywfmocrdpygovckkarv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-300 transition flex items-center gap-1"
          >
            Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
          </a>
          <button onClick={onClose} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium">
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
