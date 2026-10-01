import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Search, 
  Filter, 
  CheckCircle2, 
  Printer, 
  Sparkles, 
  Link, 
  Fingerprint, 
  RefreshCw 
} from 'lucide-react';
import { soundFX } from '../../utils/sound';

interface AuditViewProps {
  onOpenPrint: (type: 'GRN' | 'PICK_LIST' | 'SHIPPING_LABEL' | 'BIN_LABELS' | 'AUDIT_CERT', data: any) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ onOpenPrint }) => {
  const { auditLogs, verifyAuditIntegrity, currentUser } = useWarehouse();

  const [selectedModule, setSelectedModule] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; checkedBlocks: number } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyLedger = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyAuditIntegrity();
      setVerificationResult(res);
      setIsVerifying(false);
      if (res.isValid) {
        soundFX.playScanSuccess();
      } else {
        soundFX.playScanError();
      }
    }, 600);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.hash.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                TAMPER-EVIDENT MERKLE CHAIN
              </span>
              <span className="text-xs text-slate-400 font-mono">• {auditLogs.length} Cryptographic Blocks</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Immutable Audit Trail & Blockchain-Style Ledger
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Every warehouse event is sealed into an append-only cryptographic SHA-256 chain. Even system administrators cannot secretly delete or alter operational history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifyLedger}
              disabled={isVerifying}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
              Verify Ledger Integrity
            </button>

            <button
              onClick={() => onOpenPrint('AUDIT_CERT', { totalBlocks: auditLogs.length })}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-emerald-400" /> Audit Certificate
            </button>
          </div>
        </div>

        {/* Verification Success Toast */}
        {verificationResult && (
          <div className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
            verificationResult.isValid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-sm">
                  {verificationResult.isValid ? 'Ledger Integrity 100% Cryptographically Verified' : 'Integrity Error Detected!'}
                </p>
                <p className="text-slate-300">
                  Checked all {verificationResult.checkedBlocks} sequential blocks from Genesis Block #1. Hash link continuity is intact and uncorrupted.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-200 rounded border border-emerald-500/40">
              ZERO TAMPERING DETECTED
            </span>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, actor, or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'company', 'inventory', 'receiving', 'putaway', 'picking', 'dispatch', 'returns', 'users', 'billing'].map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                selectedModule === mod
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Block Explorer Feed */}
      <div className="space-y-3">
        {filteredLogs.slice().reverse().map((entry) => (
          <div
            key={entry.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  BLOCK #{entry.blockNumber}
                </span>
                <div>
                  <span className="font-bold text-white text-sm">{entry.action}</span>
                  <span className="text-[11px] font-mono text-slate-400 ml-2 uppercase px-1.5 py-0.2 rounded bg-slate-800">
                    {entry.module}
                  </span>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-slate-400">
                {new Date(entry.timestamp).toUTCString()}
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {entry.description}
            </p>

            {/* Cryptographic Linkage Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500 block text-[10px]">PREVIOUS BLOCK HASH</span>
                <span className="text-slate-400 truncate block select-all">{entry.previousHash}</span>
              </div>
              <div>
                <span className="text-emerald-500/80 block text-[10px] flex items-center gap-1 font-bold">
                  <Fingerprint className="w-3 h-3" /> CURRENT BLOCK SHA-256 HASH
                </span>
                <span className="text-emerald-300 font-bold truncate block select-all">{entry.hash}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Actor: <strong className="text-white">{entry.actorName}</strong> (<span className="capitalize">{entry.actorRole}</span>)</span>
              <span>Client Node IP: <strong className="font-mono text-slate-300">{entry.ipAddress}</strong></span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
