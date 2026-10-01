import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Printer, 
  Barcode, 
  MoveRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { generateBarcodeSvg } from '../../utils/barcode';

interface InventoryViewProps {
  onOpenPrint: (type: 'GRN' | 'PICK_LIST' | 'SHIPPING_LABEL' | 'BIN_LABELS' | 'AUDIT_CERT', data: any) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenPrint }) => {
  const { 
    products, 
    inventoryStock, 
    adjustments, 
    currentUser, 
    activeWarehouse, 
    requestAdjustment, 
    approveAdjustment, 
    transferStockBetweenBins,
    can 
  } = useWarehouse();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'bins' | 'adjustments'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Adjustment modal state
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [adjProductId, setAdjProductId] = useState(products[0]?.id || '');
  const [adjLocationId, setAdjLocationId] = useState(activeWarehouse.locations[0]?.id || '');
  const [adjNewQty, setAdjNewQty] = useState('');
  const [adjReason, setAdjReason] = useState<'COUNT_DISCREPANCY' | 'DAMAGED_IN_RACK' | 'EXPIRED_LOT' | 'FOUND_ITEM'>('COUNT_DISCREPANCY');
  const [adjNotes, setAdjNotes] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStockId, setTransferStockId] = useState('');
  const [transferTargetLocId, setTransferTargetLocId] = useState(activeWarehouse.locations[1]?.id || '');
  const [transferQty, setTransferQty] = useState('1');

  // Barcode preview
  const [previewBarcode, setPreviewBarcode] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.barcode.includes(searchTerm);
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestAdjustment(
      adjProductId,
      adjLocationId,
      parseInt(adjNewQty) || 0,
      adjReason,
      adjNotes || 'Cycle count discrepancy detected during shift.'
    );
    setActionFeedback(res);
    setShowAdjModal(false);
    setAdjNotes('');
  };

  const handleApproveAdjustment = (adjId: string, approve: boolean) => {
    const res = approveAdjustment(adjId, approve, approve ? 'Verified by supervisor.' : 'Discrepancy rejected upon recount.');
    setActionFeedback(res);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const res = transferStockBetweenBins(transferStockId, transferTargetLocId, parseInt(transferQty) || 1);
    setActionFeedback(res);
    setShowTransferModal(false);
  };

  const pendingAdjustmentsCount = adjustments.filter(a => a.status === 'PENDING_SUPERVISOR_APPROVAL').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-400" />
              Warehouse Inventory & Bin Balances
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time multi-bin inventory tracking with lot expiration control and supervised discrepancy write-downs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAdjModal(true);
                setActionFeedback(null);
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-600/20"
            >
              <AlertTriangle className="w-4 h-4" /> Request Stock Adjustment
            </button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex border-b border-slate-800 pt-2 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`pb-3 transition relative ${activeSubTab === 'catalog' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Product Catalog ({products.length} SKUs)
          </button>
          <button
            onClick={() => setActiveSubTab('bins')}
            className={`pb-3 transition relative ${activeSubTab === 'bins' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Stock by Location ({inventoryStock.length} Batches)
          </button>
          <button
            onClick={() => setActiveSubTab('adjustments')}
            className={`pb-3 transition relative flex items-center gap-1.5 ${activeSubTab === 'adjustments' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>Stock Adjustments</span>
            {pendingAdjustmentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-mono">
                {pendingAdjustmentsCount} Pending
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${actionFeedback.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          <div className="flex items-center gap-2">
            {actionFeedback.success ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* SUB-TAB 1: PRODUCT CATALOG */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search SKU, name, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'Electronics', 'Robotics', 'Medical', 'Industrial', 'Consumer Goods'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Catalog Grid / Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <th className="py-3 px-4">Product / SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Available Qty</th>
                    <th className="py-3 px-4 text-right">Allocated</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Total Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Barcode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredProducts.map(p => {
                    const isLow = p.currentStock <= p.reorderPoint;
                    const val = p.currentStock * p.unitCost;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                            />
                            <div>
                              <span className="font-bold text-white block">{p.name}</span>
                              <span className="font-mono text-[11px] text-slate-400">{p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {p.currentStock} {p.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {p.allocatedStock} {p.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          ₦{p.unitCost.toLocaleString('en-NG')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          ₦{val.toLocaleString('en-NG')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                              Low Stock (&lt;{p.reorderPoint})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              Healthy
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setPreviewBarcode(p.barcode)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] inline-flex items-center gap-1 transition"
                            title="Inspect Barcode"
                          >
                            <Barcode className="w-3.5 h-3.5 text-brand-400" />
                            {p.barcode}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STOCK BY LOCATION */}
      {activeSubTab === 'bins' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Physical Bin Stock Balances</h3>
              <p className="text-xs text-slate-400">Granular inventory mapping with lot number and bin codes</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                  <th className="py-3 px-4">Location Bin</th>
                  <th className="py-3 px-4">Product Item</th>
                  <th className="py-3 px-4">Lot Number</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {inventoryStock.map(stock => {
                  const prod = products.find(p => p.id === stock.productId);
                  return (
                    <tr key={stock.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                          {stock.locationCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{prod?.name || stock.productId}</span>
                        <span className="font-mono text-[10px] text-slate-400">{prod?.sku}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {stock.lotNumber}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                        {stock.quantity} {prod?.unit || 'PCS'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {stock.expiryDate || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          stock.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                          stock.status === 'quarantined' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {stock.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setTransferStockId(stock.id);
                            setShowTransferModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition"
                        >
                          <MoveRight className="w-3 h-3 text-brand-400" /> Transfer Bin
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STOCK ADJUSTMENTS (FIRST-CLASS RBAC DEMO) */}
      {activeSubTab === 'adjustments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="p-4 bg-brand-950/30 border border-brand-500/30 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-brand-300">
              <Sparkles className="w-4 h-4" />
              Document Specification RBAC Rule:
            </div>
            <p className="text-slate-300">
              "Warehouse Officer can receive stock but <strong>cannot approve stock adjustments</strong>. Supervisor can <strong>approve adjustments</strong> but cannot change financial settings."
            </p>
          </div>

          <div className="space-y-3">
            {adjustments.map(adj => {
              const prod = products.find(p => p.id === adj.productId);
              const isPending = adj.status === 'PENDING_SUPERVISOR_APPROVAL';

              return (
                <div key={adj.id} className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">{adj.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        adj.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {adj.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white">
                      Product: {prod?.name} ({prod?.sku}) at Bin {adj.locationId}
                    </p>
                    
                    <p className="text-xs text-slate-300">
                      Previous Count: <strong className="font-mono">{adj.previousQty}</strong> → Adjusted To: <strong className="font-mono">{adj.adjustedQty}</strong> (
                      <span className={adj.differenceQty < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {adj.differenceQty > 0 ? `+${adj.differenceQty}` : adj.differenceQty} units
                      </span>)
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Reason: <strong className="text-slate-200">{adj.reasonCode}</strong> • Notes: "{adj.notes}"
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Requested By: {adj.requestedByUserName} on {new Date(adj.requestedDate).toLocaleString()}
                    </p>
                  </div>

                  {/* Supervisor Approval Actions */}
                  {isPending && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveAdjustment(adj.id, true)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Adjustment
                      </button>
                      <button
                        onClick={() => handleApproveAdjustment(adj.id, false)}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REQUEST STOCK ADJUSTMENT MODAL */}
      {showAdjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Request Inventory Count Adjustment
            </h3>
            
            <form onSubmit={handleCreateAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Select Product SKU</label>
                <select
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name} (Current: {p.currentStock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Select Storage Location Bin</label>
                <select
                  value={adjLocationId}
                  onChange={(e) => setAdjLocationId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {activeWarehouse.locations.map(l => (
                    <option key={l.id} value={l.id}>{l.id} ({l.zone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Actual Physical Counted Qty</label>
                <input
                  type="number"
                  placeholder="e.g. 58"
                  value={adjNewQty}
                  onChange={(e) => setAdjNewQty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Discrepancy Reason Code</label>
                <select
                  value={adjReason}
                  onChange={(e: any) => setAdjReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="COUNT_DISCREPANCY">COUNT_DISCREPANCY (Physical count doesn't match)</option>
                  <option value="DAMAGED_IN_RACK">DAMAGED_IN_RACK (Damage during forklift movement)</option>
                  <option value="EXPIRED_LOT">EXPIRED_LOT (Lot expired in cold chain)</option>
                  <option value="FOUND_ITEM">FOUND_ITEM (Unregistered surplus located)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Shift Notes / Audit Context</label>
                <textarea
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  placeholder="Describe where the discrepancy occurred..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white h-20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Move Inventory to Another Bin</h3>
            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Target Destination Bin</label>
                <select
                  value={transferTargetLocId}
                  onChange={(e) => setTransferTargetLocId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {activeWarehouse.locations.map(l => (
                    <option key={l.id} value={l.id}>{l.id} ({l.zone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  min="1"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl"
                >
                  Execute Relocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARCODE PREVIEW MODAL */}
      {previewBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <h3 className="font-bold text-white text-base">Product Barcode Label</h3>
            <div className="p-4 bg-white rounded-xl">
              <div dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(previewBarcode, 240, 60) }} />
              <span className="font-mono text-xs font-bold text-slate-900 mt-2 block">{previewBarcode}</span>
            </div>
            <button
              onClick={() => setPreviewBarcode(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
