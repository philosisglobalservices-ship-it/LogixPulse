import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  CheckSquare, 
  Layers, 
  MapPin, 
  Scan, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import { soundFX } from '../../utils/sound';

interface PickingViewProps {
  onOpenScanner: () => void;
  onOpenPrint: (type: 'GRN' | 'PICK_LIST' | 'SHIPPING_LABEL' | 'BIN_LABELS' | 'AUDIT_CERT', data: any) => void;
}

export const PickingView: React.FC<PickingViewProps> = ({ onOpenScanner, onOpenPrint }) => {
  const { orders, pickWaves, products, createPickWave, completePickItem, currentUser, can } = useWarehouse();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [selectedOrdersForWave, setSelectedOrdersForWave] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrdersForWave(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerateWave = () => {
    if (selectedOrdersForWave.length === 0) return;
    const res = createPickWave(selectedOrdersForWave);
    setFeedback(res);
    setSelectedOrdersForWave([]);
  };

  const handleScanPickItem = (orderId: string, productId: string, requestedQty: number) => {
    const res = completePickItem(orderId, productId, requestedQty);
    setFeedback(res);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                OUTBOUND FULFILLMENT
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-brand-400" />
              Wave Picking & Shortest-Path Routing
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Group orders into picking waves, optimize travel trajectories across aisles, and eliminate mis-picks with barcode scan verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrint('PICK_LIST', { waveNumber: 'WAVE-2026-091', totalItems: 12 })}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-purple-400" /> Print Pick List
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

      {/* Picking Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Orders & Waves Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" /> Outbound Orders Queue
            </h3>
            <span className="text-xs font-mono text-slate-400">{orders.length} Orders</span>
          </div>

          {/* Wave Creation trigger button */}
          {selectedOrdersForWave.length > 0 && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">
                {selectedOrdersForWave.length} Orders Selected
              </span>
              <button
                onClick={handleGenerateWave}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-md"
              >
                Create Wave
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            {orders.map(order => {
              const isSelected = order.id === selectedOrder?.id;
              const isChecked = selectedOrdersForWave.includes(order.id);
              const isPending = order.status === 'PENDING_PICK';

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-3.5 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500/40 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSelectOrder(order.id);
                          }}
                          className="rounded bg-slate-800 border-slate-600 text-brand-500 focus:ring-0"
                        />
                      )}
                      <span className="font-mono font-bold text-xs text-white">{order.orderNumber}</span>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      order.status === 'PICKED' ? 'bg-emerald-500/20 text-emerald-300' :
                      order.status === 'PICKING' ? 'bg-purple-500/20 text-purple-300' :
                      order.status === 'PACKING' ? 'bg-indigo-500/20 text-indigo-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200 mt-1">{order.customerName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{order.destinationAddress}</p>

                  <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{order.items.length} SKUs ({order.items.reduce((s, it) => s + it.requestedQty, 0)} Items)</span>
                    <span className="text-brand-400 flex items-center">Open Pick List <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Pick Path Route & Item Verification */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedOrder ? (
            <>
              {/* Order Header */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{selectedOrder.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      selectedOrder.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {selectedOrder.priority}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-0.5">Customer: {selectedOrder.customerName}</p>
                  <p className="text-slate-400 text-[11px]">{selectedOrder.destinationAddress}</p>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block font-mono text-[10px]">ORDER STATUS</span>
                  <span className="text-sm font-bold text-brand-300 font-mono">
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Optimized Sequence Pick Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Optimized Pick Route Sequence (Shortest Travel Distance):
                  </h3>
                  <span className="text-xs font-mono text-purple-300">
                    Aisle Path Optimization: Active
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    const isPicked = item.pickedQty >= item.requestedQty;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isPicked
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-slate-800/70 border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-brand-400">
                            #{idx + 1}
                          </div>
                          
                          <img src={prod?.imageUrl} alt={prod?.name} className="w-10 h-10 rounded-lg object-cover border border-slate-700" />

                          <div>
                            <span className="font-bold text-white text-xs block">{prod?.name}</span>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                              <span>SKU: {prod?.sku}</span>
                              <span>•</span>
                              <span className="text-brand-300 font-bold bg-brand-500/10 px-1.5 py-0.2 rounded">
                                Location: {item.locationId}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-mono">Picked / Requested:</span>
                            <span className="text-xs font-mono font-bold text-white">
                              {item.pickedQty} / {item.requestedQty} {prod?.unit || 'PCS'}
                            </span>
                          </div>

                          {isPicked ? (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => handleScanPickItem(selectedOrder.id, item.productId, item.requestedQty)}
                              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                            >
                              <Scan className="w-3.5 h-3.5" /> Scan & Pick
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedOrder.status === 'PICKED' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center justify-between text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>All items picked! Order routed to Outbound Packing Station for carrier manifest.</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">Select an order from the queue to start picking.</p>
          )}
        </div>

      </div>

    </div>
  );
};
