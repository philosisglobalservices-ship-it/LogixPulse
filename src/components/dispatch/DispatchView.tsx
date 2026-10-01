import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  Truck, 
  PackageCheck, 
  Printer, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  Scale, 
  Box, 
  Barcode, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DispatchViewProps {
  onOpenPrint: (type: 'GRN' | 'PICK_LIST' | 'SHIPPING_LABEL' | 'BIN_LABELS' | 'AUDIT_CERT', data: any) => void;
}

export const DispatchView: React.FC<DispatchViewProps> = ({ onOpenPrint }) => {
  const { orders, shipments, packAndDispatchShipment, products, currentUser, can } = useWarehouse();

  // Orders that are picked and ready for packing/dispatch
  const packableOrders = orders.filter(o => o.status === 'PICKED' || o.status === 'PACKING');

  const [selectedOrderId, setSelectedOrderId] = useState<string>(packableOrders[0]?.id || orders[0]?.id || '');
  const [selectedCarrier, setSelectedCarrier] = useState<'GIG Logistics (GIGL)' | 'Red Star Express (FedEx)' | 'DHL Express Nigeria' | 'Kwik Delivery Fleet'>('GIG Logistics (GIGL)');
  const [packageType, setPackageType] = useState<'Small Box' | 'Medium Box' | 'Heavy Carton' | 'Pallet'>('Medium Box');
  const [packageWeight, setPackageWeight] = useState('3.5');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; trackingNumber?: string } | null>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleDispatch = () => {
    if (!selectedOrder) return;
    const res = packAndDispatchShipment(
      selectedOrder.id,
      selectedCarrier,
      packageType,
      parseFloat(packageWeight) || 2.5
    );
    setFeedback(res);

    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                OUTBOUND LOGISTICS
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Truck className="w-6 h-6 text-brand-400" />
              Packing Station, Manifest & Carrier Handover
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Box dimensions calculation, digital scale tare/weight verification, Bill of Lading (BOL) issuance, and courier handover.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${feedback.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          <div className="flex items-center gap-2">
            {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <div>
              <p className="font-bold">{feedback.message}</p>
              {feedback.trackingNumber && (
                <p className="font-mono text-[11px] text-emerald-200 mt-0.5">
                  Carrier Tracking Code: {feedback.trackingNumber}
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Main Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Packable Orders Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Box className="w-4 h-4 text-brand-400" /> Staged for Packing ({packableOrders.length})
            </h3>
          </div>

          {packableOrders.length === 0 ? (
            <div className="p-6 bg-slate-800/40 rounded-xl text-center text-slate-500 text-xs">
              No orders waiting at packing table. Complete picking waves to stage cargo.
            </div>
          ) : (
            <div className="space-y-2.5">
              {packableOrders.map(order => {
                const isSelected = order.id === selectedOrderId;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500/40 text-white'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-mono font-bold text-xs text-white">{order.orderNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300">
                        {order.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-200">{order.customerName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{order.destinationAddress}</p>

                    <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{order.items.length} Picked Line Items</span>
                      <span className="text-brand-400 font-medium">Pack & Seal →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Packing & Shipping Station */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedOrder ? (
            <>
              {/* Order Info */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedOrder.orderNumber}</h3>
                  <p className="text-slate-300 mt-0.5">Ship To: <strong className="text-white">{selectedOrder.customerName}</strong></p>
                  <p className="text-slate-400 text-[11px]">{selectedOrder.destinationAddress}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">DESTINATION CARRIER GATE</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">DOCK 4: OUTBOUND STAGING</span>
                </div>
              </div>

              {/* Box & Carrier Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Packaging container selector */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-3">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-brand-400" /> Package Container Type
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {(['Small Box', 'Medium Box', 'Heavy Carton', 'Pallet'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPackageType(type)}
                        className={`p-2.5 rounded-lg border text-left font-medium transition ${
                          packageType === type
                            ? 'bg-brand-600 text-white border-brand-500 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-slate-400 block mb-1 font-mono text-[11px] flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-brand-400" /> Digital Scale Gross Weight (KG)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Carrier selector */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-3">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" /> Carrier & Service Level
                  </label>

                  <div className="space-y-2">
                    {(['GIG Logistics (GIGL)', 'Red Star Express (FedEx)', 'DHL Express Nigeria', 'Kwik Delivery Fleet'] as const).map(carrier => (
                      <button
                        key={carrier}
                        type="button"
                        onClick={() => setSelectedCarrier(carrier)}
                        className={`w-full p-2.5 rounded-lg border text-left font-medium transition flex items-center justify-between ${
                          selectedCarrier === carrier
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{carrier}</span>
                        {selectedCarrier === carrier && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action */}
              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  Officer: <strong className="text-white">{currentUser.name}</strong>
                </span>
                <button
                  onClick={handleDispatch}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" /> Seal, Manifest & Dispatch Cargo
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">Select an order ready for dispatch.</p>
          )}
        </div>

      </div>

      {/* Dispatched Cargo Manifest Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Carrier Dispatch Manifest & BOL History
            </h3>
            <p className="text-xs text-slate-400">Official carrier tracking and handover documentation</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-3">Shipment Ref</th>
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Customer / Destination</th>
                <th className="py-2.5 px-3">Carrier & Service</th>
                <th className="py-2.5 px-3">Tracking Code</th>
                <th className="py-2.5 px-3 text-right">Weight</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {shipments.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {s.shipmentNumber}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {s.orderNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{s.customerName}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">{s.shippingAddress}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-200">{s.carrier}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">BOL: {s.bolNumber}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-brand-300 font-bold bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                      {s.trackingNumber}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {s.weightKg} KG
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onOpenPrint('SHIPPING_LABEL', s)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" /> Print Label & BOL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
