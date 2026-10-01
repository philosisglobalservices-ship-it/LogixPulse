import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  ArrowDownToLine, 
  Truck, 
  Barcode, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Scan, 
  FileText, 
  ShieldAlert,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { soundFX } from '../../utils/sound';

interface ReceivingViewProps {
  onOpenScanner: () => void;
  onOpenPrint: (type: 'GRN' | 'PICK_LIST' | 'SHIPPING_LABEL' | 'BIN_LABELS' | 'AUDIT_CERT', data: any) => void;
}

export const ReceivingView: React.FC<ReceivingViewProps> = ({ onOpenScanner, onOpenPrint }) => {
  const { receipts, products, activeWarehouse, receiveInboundShipment, currentUser, can } = useWarehouse();

  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(receipts[0]?.id || '');
  const [receivingLines, setReceivingLines] = useState<any[]>(() => {
    const r = receipts[0];
    return r ? r.lines.map(l => ({ ...l, receivedQty: l.expectedQty, acceptedQty: l.expectedQty, damagedQty: 0, stagingLocId: 'LOC-STG-01' })) : [];
  });
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const selectedReceipt = receipts.find(r => r.id === selectedReceiptId) || receipts[0];

  const handleSelectReceipt = (id: string) => {
    setSelectedReceiptId(id);
    const r = receipts.find(item => item.id === id);
    if (r) {
      setReceivingLines(r.lines.map(l => ({
        ...l,
        receivedQty: l.expectedQty,
        acceptedQty: l.expectedQty,
        damagedQty: 0,
        stagingLocId: 'LOC-STG-01'
      })));
    }
  };

  const handleLineChange = (idx: number, field: string, value: any) => {
    setReceivingLines(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleFinalizeReceiving = () => {
    if (!selectedReceipt) return;
    const res = receiveInboundShipment(selectedReceipt.id, receivingLines);
    setFeedback(res);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                INBOUND LOGISTICS
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ArrowDownToLine className="w-6 h-6 text-brand-400" />
              Inbound Receiving & Goods Received Notes (GRN)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Scan inbound purchase orders, verify physical shipment against packing manifest, inspect for transit damage, and generate GRN.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScanner}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <Scan className="w-4 h-4 text-brand-400" /> Handheld Scan Mode
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

      {/* Main Receiving Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Docked Shipments Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-400" /> Inbound Shipments
            </h3>
            <span className="text-xs font-mono text-slate-400">{receipts.length} POs</span>
          </div>

          <div className="space-y-2.5">
            {receipts.map(rcp => {
              const isSelected = rcp.id === selectedReceipt?.id;
              const isDone = rcp.status === 'COMPLETED';

              return (
                <button
                  key={rcp.id}
                  onClick={() => handleSelectReceipt(rcp.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500/40 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono font-bold text-xs text-white">{rcp.receiptNumber}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {rcp.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200">{rcp.supplierName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Ref: {rcp.poNumber} • Carrier: {rcp.carrier}</p>

                  <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{rcp.lines.length} Line Items</span>
                    <span className="text-brand-400 flex items-center">Inspect <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Inspection & Receiving Gate Station */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedReceipt ? (
            <>
              {/* Receipt Header details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px]">RECEIVING MANIFEST</span>
                  <h2 className="text-base font-bold text-white mt-0.5">{selectedReceipt.receiptNumber}</h2>
                  <p className="text-slate-300">{selectedReceipt.supplierName} • PO #{selectedReceipt.poNumber}</p>
                </div>

                <div className="flex items-center gap-3">
                  {selectedReceipt.status === 'COMPLETED' ? (
                    <button
                      onClick={() => onOpenPrint('GRN', selectedReceipt)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-md"
                    >
                      <Printer className="w-4 h-4 text-emerald-400" /> Print Official GRN
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-mono font-bold">
                      DOCK 2: READY FOR INSPECTION
                    </span>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Verification & Physical Inspection Lines:
                </h3>

                <div className="space-y-3">
                  {receivingLines.map((line, idx) => {
                    const prod = products.find(p => p.id === line.productId);
                    const isReadOnly = selectedReceipt.status === 'COMPLETED';

                    return (
                      <div key={idx} className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/80 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-2">
                          <div>
                            <span className="font-bold text-white text-sm block">{prod?.name || line.productId}</span>
                            <span className="font-mono text-xs text-brand-300">{prod?.sku} • Barcode: {prod?.barcode}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-slate-400">Expected PO Qty:</span>
                            <span className="text-xs font-mono font-bold text-white ml-1.5">{line.expectedQty} {prod?.unit || 'PCS'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="text-slate-400 font-medium block mb-1">Received Count</label>
                            <input
                              type="number"
                              disabled={isReadOnly}
                              value={line.receivedQty}
                              onChange={(e) => handleLineChange(idx, 'receivedQty', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 font-medium block mb-1">Accepted Qty</label>
                            <input
                              type="number"
                              disabled={isReadOnly}
                              value={line.acceptedQty}
                              onChange={(e) => handleLineChange(idx, 'acceptedQty', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 font-medium block mb-1">Damaged Qty</label>
                            <input
                              type="number"
                              disabled={isReadOnly}
                              value={line.damagedQty}
                              onChange={(e) => handleLineChange(idx, 'damagedQty', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-rose-400 font-mono text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 font-medium block mb-1">Lot / Batch #</label>
                            <input
                              type="text"
                              disabled={isReadOnly}
                              value={line.lotNumber}
                              onChange={(e) => handleLineChange(idx, 'lotNumber', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>Target Staging Area: <strong className="text-slate-200">LOC-STG-01 (Inbound Bay 1)</strong></span>
                          {line.damagedQty > 0 && (
                            <span className="text-rose-400 flex items-center gap-1 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {line.damagedQty} units will be automatically isolated to Quarantine!
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar */}
              {selectedReceipt.status !== 'COMPLETED' ? (
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    Inspecting Officer: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
                  </span>
                  <button
                    onClick={handleFinalizeReceiving}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-brand-500/25 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Finalize Receipt & Issue GRN
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center justify-between text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Receipt finalized and Goods Received Note issued by {selectedReceipt.receivedByUserName}. Put-away tasks generated.</span>
                  </div>
                  <button
                    onClick={() => onOpenPrint('GRN', selectedReceipt)}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-500 transition"
                  >
                    Print GRN
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">Select an inbound PO from the left.</p>
          )}
        </div>

      </div>

    </div>
  );
};
