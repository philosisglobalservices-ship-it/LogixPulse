import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  MoveRight, 
  Scan, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  Sparkles, 
  ShieldAlert, 
  Package,
  Barcode
} from 'lucide-react';
import { generateBarcodeSvg } from '../../utils/barcode';

interface PutawayViewProps {
  onOpenScanner: () => void;
}

export const PutawayView: React.FC<PutawayViewProps> = ({ onOpenScanner }) => {
  const { putawayTasks, products, activeWarehouse, completePutaway, currentUser, can } = useWarehouse();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(putawayTasks.find(t => t.status === 'PENDING')?.id || putawayTasks[0]?.id || '');
  const [selectedDestinationBin, setSelectedDestinationBin] = useState<string>('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const selectedTask = putawayTasks.find(t => t.id === selectedTaskId) || putawayTasks[0];
  const prod = products.find(p => p.id === selectedTask?.productId);

  const handleConfirmPutaway = () => {
    if (!selectedTask) return;
    const dest = selectedDestinationBin || selectedTask.suggestedLocationId;
    const res = completePutaway(selectedTask.id, dest);
    setFeedback(res);
  };

  const pendingCount = putawayTasks.filter(t => t.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                INTERNAL MOVEMENT
              </span>
              <span className="text-xs text-slate-400 font-mono">• {pendingCount} Tasks Awaiting Clearance</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <MoveRight className="w-6 h-6 text-brand-400" />
              Smart System-Directed Put-Away
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Automated velocity and temperature-aware bin recommendations to clear inbound staging docks into permanent storage locations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScanner}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <Scan className="w-4 h-4 text-brand-400" /> Scan Destination Bin
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${feedback.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          <div className="flex items-center gap-2">
            {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Putaway Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Put-away Task List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" /> Staging Clearance Queue
            </h3>
            <span className="text-xs font-mono text-slate-400">{putawayTasks.length} Total</span>
          </div>

          <div className="space-y-2.5">
            {putawayTasks.map(t => {
              const itemProd = products.find(p => p.id === t.productId);
              const isSelected = t.id === selectedTask?.id;
              const isDone = t.status === 'COMPLETED';

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTaskId(t.id);
                    setSelectedDestinationBin(t.suggestedLocationId);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500/40 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono font-bold text-xs text-white">{t.id}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200">{itemProd?.name || t.productId}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Lot: {t.lotNumber} • Qty: {t.quantity}</p>

                  <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">From: {t.fromLocationId}</span>
                    <span className="text-indigo-400 font-mono font-bold">Target: {t.suggestedLocationId}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Smart Put-away Execution Station */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedTask ? (
            <>
              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                  <div className="flex items-center space-x-3">
                    <img src={prod?.imageUrl} alt={prod?.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                    <div>
                      <h2 className="text-base font-bold text-white">{prod?.name}</h2>
                      <span className="font-mono text-xs text-brand-300">{prod?.sku} • Lot: {selectedTask.lotNumber}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">Quantity to Put Away:</span>
                    <span className="text-xl font-black font-mono text-white">{selectedTask.quantity} {prod?.unit || 'PCS'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block font-mono text-[10px] uppercase">Origin Location</span>
                    <p className="font-bold text-white text-sm mt-1">{selectedTask.fromLocationId}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Inbound Staging Bay</p>
                  </div>

                  <div className="bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-500/40">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> System Suggested Bin
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200">
                        Smart Velocity Match
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm mt-1">{selectedTask.suggestedLocationId}</p>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {prod?.isColdChain ? 'Cold-Chain Certified Vault Zone' : 'High-Throughput Pick Bin Zone'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Destination Verification Scanner Target */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-brand-400" /> Confirm Destination Bin Barcode:
                  </h4>
                  <span className="text-xs text-slate-400">Scan or select target shelf</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeWarehouse.locations.filter(l => l.zone !== 'Staging').slice(0, 4).map(loc => {
                    const isPicked = (selectedDestinationBin || selectedTask.suggestedLocationId) === loc.id;
                    return (
                      <button
                        key={loc.id}
                        disabled={selectedTask.status === 'COMPLETED'}
                        onClick={() => setSelectedDestinationBin(loc.id)}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          isPicked
                            ? 'bg-brand-500/20 border-brand-400 text-white'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-mono font-bold text-xs block text-white">{loc.id}</span>
                          <span className="text-[10px] text-slate-400">{loc.zone} • Shelf {loc.shelf}</span>
                        </div>
                        {isPicked && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action */}
              {selectedTask.status !== 'COMPLETED' ? (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-400">
                    Operator: <strong className="text-white">{currentUser.name}</strong>
                  </span>
                  <button
                    onClick={handleConfirmPutaway}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-brand-500/25 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify Scan & Store Item
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Item stored into bin <strong>{selectedTask.actualLocationId}</strong>. Inventory balance updated and putaway task closed.</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">Select a put-away task from the left.</p>
          )}
        </div>

      </div>

    </div>
  );
};
