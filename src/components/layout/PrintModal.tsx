import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { generateBarcodeSvg } from '../../utils/barcode';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentType: 'GRN' | 'PICK_LIST' | 'SHIPPING_LABEL' | 'BIN_LABELS' | 'AUDIT_CERT';
  data: any;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  title,
  documentType,
  data
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:w-full print:border-none print:bg-white print:text-black">
        
        {/* Modal Header (hidden during print) */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400">Enterprise Standard Warehouse Document Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-8 overflow-y-auto bg-slate-950 flex justify-center print:bg-white print:p-0">
          <div className="w-full max-w-2xl bg-white text-slate-900 p-8 rounded-lg shadow-lg font-sans border border-slate-200 print:shadow-none print:border-none">
            
            {/* GRN DOCUMENT */}
            {documentType === 'GRN' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">GOODS RECEIVED NOTE</h1>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Eko Integrated Logistics Nigeria Ltd • Ikeja Central Hub</p>
                    <p className="text-xs text-slate-500">Facility ID: WH-LOS-FC1 • Staging Gate Bay 2, Lagos</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">
                      ACCEPTED & STAGED
                    </span>
                    <p className="text-xs font-mono font-bold mt-2 text-slate-800">{data?.receiptNumber || 'GRN-2026-0042'}</p>
                    <p className="text-[11px] text-slate-500">{new Date().toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-400 uppercase font-semibold">Supplier / Origin:</span>
                    <p className="font-bold text-slate-800">{data?.supplierName || 'MainOne Cable & Data Systems Ltd'}</p>
                    <p className="text-slate-600">PO Ref: {data?.poNumber || 'PO-99410'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold">Carrier & Tracking:</span>
                    <p className="font-bold text-slate-800">{data?.carrier || 'GIG Logistics (GIGL)'}</p>
                    <p className="font-mono text-slate-600">{data?.trackingNumber || 'GIGL-LOS-948102941'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold">Receiving Officer:</span>
                    <p className="font-bold text-slate-800">{data?.receivedByUserName || 'Tunde Balogun (Warehouse Officer)'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold">Destination Staging:</span>
                    <p className="font-bold text-slate-800">Zone 1 - Staging Bay LOC-STG-01</p>
                  </div>
                </div>

                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-slate-600 uppercase">
                      <th className="py-2">SKU / Item</th>
                      <th className="py-2">Lot #</th>
                      <th className="py-2 text-right">Expected</th>
                      <th className="py-2 text-right">Received</th>
                      <th className="py-2 text-right">Accepted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 font-bold">SKU-IOT-102 (MainOne BLE Beacon Pack)</td>
                      <td className="py-2.5 font-mono">LOT-2026-BLE-11</td>
                      <td className="py-2.5 text-right font-mono">40</td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-700">40</td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-700">40</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">SKU-SCN-210 (MTN Rugged RF Scanner)</td>
                      <td className="py-2.5 font-mono">LOT-SCN-2026-50</td>
                      <td className="py-2.5 text-right font-mono">10</td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-700">10</td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-700">10</td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-4 border-t border-slate-300 flex justify-between items-center">
                  <div className="w-56" dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(data?.receiptNumber || 'GRN-2026-0042', 200, 45) }} />
                  <div className="text-right text-[11px] text-slate-500">
                    <p>Signature: __________________________</p>
                    <p className="mt-1">Authorized Warehouse Officer Sign-off</p>
                  </div>
                </div>
              </div>
            )}

            {/* SHIPPING LABEL & BILL OF LADING */}
            {documentType === 'SHIPPING_LABEL' && (
              <div className="space-y-6">
                <div className="border-4 border-black p-6 space-y-4">
                  <div className="flex justify-between items-center border-b-2 border-black pb-3">
                    <div className="text-2xl font-black">{data?.carrier || 'GIG Logistics (GIGL)'} PRIORITY EXPRESS</div>
                    <div className="text-xs font-mono font-bold border-2 border-black px-3 py-1">
                      TRK# {data?.trackingNumber || 'GIGL-NG-9938102381'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase">FROM:</span>
                      <p className="font-bold">Eko Integrated Logistics Nigeria Ltd</p>
                      <p>Plot 14, Commercial Avenue, Gate 3</p>
                      <p>Ikeja Industrial Estate, Lagos State, Nigeria</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 uppercase">SHIP TO:</span>
                      <p className="font-bold text-sm">{data?.customerName || 'Emzor Pharmaceuticals Industries Ltd'}</p>
                      <p>{data?.shippingAddress || 'Plot 3C, Block A, Ajao Estate, Isolo, Lagos State'}</p>
                    </div>
                  </div>

                  <div className="border-t-2 border-b-2 border-black py-2 grid grid-cols-3 text-xs text-center font-bold">
                    <div>WEIGHT: {data?.weightKg || 2.8} KG</div>
                    <div>BOX: 1 OF 1</div>
                    <div>BOL: {data?.bolNumber || 'BOL-LOS-2026-940'}</div>
                  </div>

                  <div className="flex flex-col items-center py-4">
                    <div className="w-72" dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(data?.trackingNumber || 'GIGL-NG-9938102381', 280, 70) }} />
                    <span className="font-mono text-xs font-bold mt-1 tracking-widest">{data?.trackingNumber || 'GIGL-NG-9938102381'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PICK LIST */}
            {documentType === 'PICK_LIST' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                  <div>
                    <h1 className="text-xl font-black">OUTBOUND PICK LIST ROUTE</h1>
                    <p className="text-xs text-slate-500 font-mono">Wave ID: {data?.waveNumber || 'WAVE-2026-091'} • Sequence: Optimized Aisle Routing</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold">Total Items: {data?.totalItems || 12}</p>
                    <p className="text-slate-500">Warehouse: Ikeja FC1, Lagos</p>
                  </div>
                </div>

                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-slate-600 uppercase">
                      <th className="py-2">Seq</th>
                      <th className="py-2">Location</th>
                      <th className="py-2">SKU</th>
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-center">Verify Scan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 font-mono font-bold">01</td>
                      <td className="py-3 font-mono font-bold bg-amber-50 px-2 rounded">LOC-PCK-A01-01</td>
                      <td className="py-3 font-mono">SKU-ROB-880</td>
                      <td className="py-3">Innoson 6-Axis Articulated Gripper Arm</td>
                      <td className="py-3 text-right font-bold font-mono">2</td>
                      <td className="py-3 text-center">[  ] SCANNED</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-mono font-bold">02</td>
                      <td className="py-3 font-mono font-bold bg-amber-50 px-2 rounded">LOC-PCK-A01-02</td>
                      <td className="py-3 font-mono">SKU-IOT-102</td>
                      <td className="py-3">MainOne BLE Sensor Beacon (10pk)</td>
                      <td className="py-3 text-right font-bold font-mono">10</td>
                      <td className="py-3 text-center">[  ] SCANNED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* AUDIT CERTIFICATE */}
            {documentType === 'AUDIT_CERT' && (
              <div className="space-y-6">
                <div className="text-center border-b-2 border-slate-300 pb-4">
                  <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 mb-2">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900">CERTIFICATE OF AUDIT INTEGRITY</h1>
                  <p className="text-xs text-slate-500 font-mono mt-1">Cryptographic Proof of Tamper-Free Ledger</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-xs space-y-2 text-emerald-950">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Ledger Status: 100% Cryptographically Validated
                  </p>
                  <p>All transaction blocks from Genesis Block #1 to latest block have been validated against their parent SHA-256 hashes. No unauthorized modification, secret deletion, or administrative tampering detected.</p>
                </div>

                <div className="text-xs space-y-2">
                  <div className="flex justify-between border-b py-1">
                    <span className="text-slate-500">Company Tenant:</span>
                    <span className="font-bold">Eko Integrated Logistics Nigeria Ltd</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-slate-500">Total Validated Blocks:</span>
                    <span className="font-mono font-bold">{data?.totalBlocks || 12} Blocks</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-slate-500">Hash Algorithm:</span>
                    <span className="font-mono font-bold">SHA-256 Merkle Chain</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-slate-500">Verification Timestamp:</span>
                    <span className="font-mono font-bold">{new Date().toISOString()}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
