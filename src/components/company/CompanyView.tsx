import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Layers, 
  Grid, 
  ThermometerSnowflake, 
  AlertOctagon, 
  Package, 
  CheckCircle2, 
  Barcode, 
  Maximize2 
} from 'lucide-react';
import { generateBarcodeSvg } from '../../utils/barcode';

export const CompanyView: React.FC = () => {
  const { 
    company, 
    branches, 
    warehouses, 
    activeWarehouse, 
    inventoryStock, 
    products, 
    addNewLocation, 
    can 
  } = useWarehouse();

  const [selectedBinId, setSelectedBinId] = useState<string | null>('LOC-PCK-A01-01');
  const [showAddBinModal, setShowAddBinModal] = useState(false);

  // New location form state
  const [newZone, setNewZone] = useState('Pick Bins');
  const [newAisle, setNewAisle] = useState('A03');
  const [newRack, setNewRack] = useState('R01');
  const [newShelf, setNewShelf] = useState('S01');
  const [newBin, setNewBin] = useState('B01');
  const [newCapacity, setNewCapacity] = useState('500');

  const selectedLocation = activeWarehouse.locations.find(l => l.id === selectedBinId);
  const stockInSelectedLocation = inventoryStock.filter(s => s.locationId === selectedBinId);

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const locId = `LOC-${newZone.substring(0, 3).toUpperCase()}-${newAisle}-${newRack}-${newShelf}-${newBin}`;
    addNewLocation({
      id: locId,
      warehouseId: activeWarehouse.id,
      zone: newZone,
      aisle: newAisle,
      rack: newRack,
      shelf: newShelf,
      bin: newBin,
      barcode: locId,
      maxCapacityKg: parseFloat(newCapacity) || 500,
      currentCapacityKg: 0,
      isColdChain: newZone === 'Cold Storage',
      status: 'available'
    });
    setSelectedBinId(locId);
    setShowAddBinModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Hierarchy Overview (Company -> Branches -> Warehouses) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-black text-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{company.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {company.subscriptionStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Corporate Entity Code: <span className="font-mono text-slate-300">{company.code}</span> • Tax ID: <span className="font-mono text-slate-300">{company.taxId}</span> • Currency: {company.currency}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 block">Branches</span>
              <span className="font-bold text-white text-sm">{branches.length} Active Hubs</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 block">Warehouses</span>
              <span className="font-bold text-white text-sm">{warehouses.length} of {company.maxWarehouses} Quota</span>
            </div>
          </div>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {branches.map(branch => {
            const branchWarehouses = warehouses.filter(w => w.branchId === branch.id);
            return (
              <div key={branch.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-start space-x-3.5">
                <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">{branch.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {branch.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{branch.address}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/40 pt-2">
                    <span>Director: <strong className="text-slate-200">{branch.managerName}</strong></span>
                    <span className="text-brand-400 font-medium">{branchWarehouses.length} Facilities Linked</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 2D Warehouse Floor Layout Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-brand-400" />
                2D Interactive Warehouse Floor Layout
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                {activeWarehouse.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any bin below to inspect real-time stock allocation, barcode, and occupancy status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {can('warehouse:manage') && (
              <button
                onClick={() => setShowAddBinModal(true)}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Add Location Bin
              </button>
            )}
          </div>
        </div>

        {/* Zone Color Legend */}
        <div className="flex flex-wrap gap-2 text-xs">
          {activeWarehouse.zones.map(z => (
            <div key={z.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color }} />
              <span className="text-slate-300 text-[11px]">{z.name}</span>
            </div>
          ))}
        </div>

        {/* 2D Floor Plan Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bin Map Matrix */}
          <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
              <span>← NORTH DOCKS / RECEIVING</span>
              <span>SOUTH DOCKS / DISPATCH →</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {activeWarehouse.locations.map(loc => {
                const isSelected = selectedBinId === loc.id;
                const zoneInfo = activeWarehouse.zones.find(z => z.name.toLowerCase().includes(loc.zone.toLowerCase())) || activeWarehouse.zones[0];
                const hasStock = inventoryStock.some(s => s.locationId === loc.id);

                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedBinId(loc.id)}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between min-h-[90px] ${
                      isSelected
                        ? 'ring-2 ring-brand-400 border-brand-400 bg-slate-800'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: zoneInfo?.color || '#3b82f6' }}
                      />
                      {loc.isColdChain && <ThermometerSnowflake className="w-3 h-3 text-cyan-400" />}
                      {loc.zone === 'Quarantine' && <AlertOctagon className="w-3 h-3 text-rose-400" />}
                    </div>

                    <div>
                      <span className="font-mono text-xs font-bold text-white block truncate">{loc.id.replace('LOC-', '')}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{loc.zone}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800">
                      <span className={`font-semibold ${hasStock ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasStock ? 'Occupied' : 'Empty'}
                      </span>
                      <span className="text-slate-500 font-mono">{loc.bin}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Bin Inspector Panel */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-400" /> Bin Detail Inspector
              </h3>
              <span className="font-mono text-xs text-brand-300 font-bold">
                {selectedLocation?.barcode || 'No Bin Selected'}
              </span>
            </div>

            {selectedLocation ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-700/40">
                  <div>
                    <span className="text-slate-400">Zone:</span>
                    <p className="font-bold text-white">{selectedLocation.zone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Aisle / Rack:</span>
                    <p className="font-bold text-white">{selectedLocation.aisle} • {selectedLocation.rack}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Max Capacity:</span>
                    <p className="font-bold text-white">{selectedLocation.maxCapacityKg} KG</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Current Load:</span>
                    <p className="font-bold text-emerald-400">{selectedLocation.currentCapacityKg} KG</p>
                  </div>
                </div>

                {/* Stored SKUs */}
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[11px] block mb-2">
                    Current Stored Inventory ({stockInSelectedLocation.length} Lots):
                  </span>

                  {stockInSelectedLocation.length === 0 ? (
                    <div className="p-4 bg-slate-900/50 rounded-xl text-center text-slate-500">
                      Bin is currently empty. Ready for Put-away.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stockInSelectedLocation.map(stock => {
                        const prod = products.find(p => p.id === stock.productId);
                        return (
                          <div key={stock.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/60 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{prod?.name || stock.productId}</span>
                              <span className="font-mono font-bold text-emerald-400">{stock.quantity} {prod?.unit || 'PCS'}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                              <span>Lot: {stock.lotNumber}</span>
                              <span className="capitalize">{stock.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Location Barcode SVG */}
                <div className="p-4 bg-white rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    LOCATION SCAN TARGET
                  </span>
                  <div className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(selectedLocation.barcode, 220, 50) }} />
                  <span className="font-mono text-xs font-bold text-slate-900 block tracking-wider">
                    {selectedLocation.barcode}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs">Select any location bin on the left to inspect.</p>
            )}
          </div>

        </div>
      </div>

      {/* Add Location Modal */}
      {showAddBinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Add Storage Location Bin</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Zone</label>
                <select
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Staging">Staging</option>
                  <option value="Pick Bins">Pick Bins</option>
                  <option value="Bulk Pallets">Bulk Pallets</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Quarantine">Quarantine</option>
                  <option value="Dispatch Dock">Dispatch Dock</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Aisle</label>
                  <input
                    type="text"
                    value={newAisle}
                    onChange={(e) => setNewAisle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Rack</label>
                  <input
                    type="text"
                    value={newRack}
                    onChange={(e) => setNewRack(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Shelf</label>
                  <input
                    type="text"
                    value={newShelf}
                    onChange={(e) => setNewShelf(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Bin Position</label>
                  <input
                    type="text"
                    value={newBin}
                    onChange={(e) => setNewBin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Max Capacity (KG)</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBinModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Create Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
