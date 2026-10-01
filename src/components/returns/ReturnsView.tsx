import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldAlert, 
  ArrowRight, 
  Plus, 
  FileText 
} from 'lucide-react';

export const ReturnsView: React.FC = () => {
  const { returns, products, activeWarehouse, processReturnRMA, currentUser, can } = useWarehouse();

  const [selectedRmaId, setSelectedRmaId] = useState<string>(returns[0]?.id || '');
  const [grading, setGrading] = useState<'GRADE_A_RESTOCK' | 'GRADE_B_REFURBISH' | 'GRADE_C_QUARANTINE' | 'GRADE_D_SCRAP'>('GRADE_A_RESTOCK');
  const [disposition, setDisposition] = useState<'RESTOCK_TO_INVENTORY' | 'MOVE_TO_QUARANTINE' | 'DISPOSAL_SCRAP'>('RESTOCK_TO_INVENTORY');
  const [notes, setNotes] = useState('Inspected returned cargo. Outer box opened, internal unit undamaged.');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const selectedRma = returns.find(r => r.id === selectedRmaId) || returns[0];

  const handleProcessReturn = () => {
    if (!selectedRma) return;
    const updatedItems = selectedRma.items.map(it => ({
      ...it,
      inspectionGrading: grading,
      disposition,
      notes
    }));

    const res = processReturnRMA(selectedRma.id, updatedItems);
    setFeedback(res);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                REVERSE LOGISTICS
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-brand-400" />
              Returns Management & RMA Triage
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Inspection grading, disposition routing to restock put-away or quarantine holding, and supplier return credit claims.
            </p>
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

      {/* Main RMA Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Returns Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Active RMA Claims</h3>
            <span className="text-xs font-mono text-slate-400">{returns.length} Records</span>
          </div>

          <div className="space-y-2.5">
            {returns.map(rma => {
              const isSelected = rma.id === selectedRma?.id;
              const isDone = rma.status === 'COMPLETED';

              return (
                <button
                  key={rma.id}
                  onClick={() => setSelectedRmaId(rma.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500/40 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono font-bold text-xs text-white">{rma.rmaNumber}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rma.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200">{rma.customerName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Ref Order: {rma.originalOrderNumber}</p>
                  <p className="text-[11px] text-rose-300 mt-1">Reason: {rma.returnReason}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Inspection Triage Station */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedRma ? (
            <>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedRma.rmaNumber}</h3>
                  <p className="text-slate-300 mt-0.5">Customer: {selectedRma.customerName} • Order #{selectedRma.originalOrderNumber}</p>
                  <p className="text-rose-400 font-medium">Return Category: {selectedRma.returnReason}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-300 font-mono">
                    STATUS: {selectedRma.status}
                  </span>
                </div>
              </div>

              {/* Items in Return */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Return Items to Inspect:
                </h4>
                {selectedRma.items.map((it, idx) => {
                  const prod = products.find(p => p.id === it.productId);
                  return (
                    <div key={idx} className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={prod?.imageUrl} alt={prod?.name} className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                        <div>
                          <p className="font-bold text-white text-xs">{prod?.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{prod?.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-white text-sm">{it.quantity} {prod?.unit || 'PCS'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Triage Decision Form */}
              {selectedRma.status !== 'COMPLETED' ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    {/* Quality Grading */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
                      <label className="font-bold text-slate-300 block">Inspection Quality Grade</label>
                      <select
                        value={grading}
                        onChange={(e: any) => setGrading(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="GRADE_A_RESTOCK">GRADE A: Like-New / Factory Sealed (Restock)</option>
                        <option value="GRADE_B_REFURBISH">GRADE B: Minor Cosmetic / Repackage</option>
                        <option value="GRADE_C_QUARANTINE">GRADE C: Damaged / Bench Diagnostic Needed</option>
                        <option value="GRADE_D_SCRAP">GRADE D: Total Loss / Write-off</option>
                      </select>
                    </div>

                    {/* Routing Disposition */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
                      <label className="font-bold text-slate-300 block">Inventory Routing Disposition</label>
                      <select
                        value={disposition}
                        onChange={(e: any) => setDisposition(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="RESTOCK_TO_INVENTORY">RESTOCK TO INVENTORY (Generates Put-Away Task)</option>
                        <option value="MOVE_TO_QUARANTINE">MOVE TO QUARANTINE (Holding Bay LOC-QUA-Q01-01)</option>
                        <option value="DISPOSAL_SCRAP">SCRAP & WRITE-OFF (Write down inventory)</option>
                      </select>
                    </div>

                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Inspection Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white h-20"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400">
                      Inspector: <strong className="text-white">{currentUser.name}</strong>
                    </span>
                    <button
                      onClick={handleProcessReturn}
                      className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Finalize RMA Inspection & Route Inventory
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>RMA completed by {selectedRma.inspectedByUserName}. Inventory disposition executed.</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">Select an RMA claim from the queue.</p>
          )}
        </div>

      </div>

    </div>
  );
};
