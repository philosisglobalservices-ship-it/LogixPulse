import React, { useState } from 'react';
import { QrCode, Scan, X, CheckCircle, AlertTriangle, Sparkles, Volume2 } from 'lucide-react';
import { soundFX } from '../../utils/sound';

interface VirtualScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  expectedType?: string;
}

export const VirtualScannerModal: React.FC<VirtualScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Handheld Barcode / RF Terminal',
  expectedType = 'Any Code'
}) => {
  const [manualCode, setManualCode] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanSubmit = (codeToScan: string) => {
    if (!codeToScan.trim()) return;
    soundFX.playScanSuccess();
    setLastScanned(codeToScan.trim());
    onScan(codeToScan.trim());
    setManualCode('');
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const sampleBarcodes = [
    { label: 'Innoson Arm SKU', code: '793573198001', type: 'Product' },
    { label: 'MainOne Beacon SKU', code: '793573198002', type: 'Product' },
    { label: 'Emzor Biologics SKU', code: '793573198003', type: 'Product' },
    { label: 'Bin A01-01 (Ikeja)', code: 'LOC-PCK-A01-01', type: 'Location' },
    { label: 'Bin A01-02 (Ikeja)', code: 'LOC-PCK-A01-02', type: 'Location' },
    { label: 'Cold Storage Vault', code: 'LOC-CLD-C01-01', type: 'Location' },
    { label: 'Staging Bay 1', code: 'LOC-STG-01', type: 'Location' },
    { label: 'Quarantine Bay', code: 'LOC-QUA-Q01-01', type: 'Location' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Terminal Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                {title}
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {expectedType}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Emulating Zebra / Honeywell Enterprise RF Handheld Terminal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Simulation */}
        <div className="p-6 space-y-5">
          <div className="relative bg-slate-950 rounded-xl p-6 border-2 border-dashed border-brand-500/40 flex flex-col items-center justify-center text-center overflow-hidden min-h-[160px]">
            {/* Red Laser Sweep line */}
            <div className="absolute inset-x-4 h-0.5 bg-rose-500/80 shadow-[0_0_12px_#f43f5e] top-1/2 -translate-y-1/2 animate-pulse" />
            
            <QrCode className="w-14 h-14 text-slate-700 mb-2 opacity-50" />
            <span className="text-xs font-mono text-slate-400 tracking-wider">
              ALIGN BARCODE OR QR CODE WITHIN RED SCANNER TARGET
            </span>
            <div className="mt-2 text-[11px] text-brand-400 flex items-center gap-1.5 font-mono">
              <Volume2 className="w-3.5 h-3.5" /> WebAudio Scanner Beep Enabled
            </div>
          </div>

          {/* Quick Manual Entry */}
          <form onSubmit={(e) => { e.preventDefault(); handleScanSubmit(manualCode); }} className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Scan Barcode Value (or Enter Code)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Scan or type barcode (e.g. 793573198001 or LOC-PCK-A01-01)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-brand-500/20"
              >
                <CheckCircle className="w-4 h-4" /> Trigger
              </button>
            </div>
          </form>

          {/* Quick 1-Click Simulation Buttons */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick-Scan Test Barcodes:
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {sampleBarcodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleScanSubmit(item.code)}
                  className="flex flex-col items-start p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 hover:border-brand-500/50 rounded-xl transition text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-brand-300">{item.label}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">{item.type}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-1">{item.code}</span>
                </button>
              ))}
            </div>
          </div>

          {lastScanned && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Scanned and verified: <strong className="font-mono">{lastScanned}</strong></span>
            </div>
          )}
        </div>

        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Shortcuts: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Esc</kbd> to close</span>
          <button onClick={onClose} className="hover:text-white transition">Cancel</button>
        </div>
      </div>
    </div>
  );
};
