import React, { useState, useEffect } from 'react';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { VirtualScannerModal } from './components/layout/VirtualScannerModal';
import { PrintModal } from './components/layout/PrintModal';
import { SupabaseModal } from './components/layout/SupabaseModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { CompanyView } from './components/company/CompanyView';
import { RbacView } from './components/rbac/RbacView';
import { InventoryView } from './components/inventory/InventoryView';
import { ReceivingView } from './components/receiving/ReceivingView';
import { PutawayView } from './components/putaway/PutawayView';
import { PickingView } from './components/picking/PickingView';
import { DispatchView } from './components/dispatch/DispatchView';
import { ReturnsView } from './components/returns/ReturnsView';
import { AuditView } from './components/audit/AuditView';
import { BillingView } from './components/billing/BillingView';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    title: string;
    documentType: 'GRN' | 'PICK_LIST' | 'SHIPPING_LABEL' | 'BIN_LABELS' | 'AUDIT_CERT';
    data: any;
  }>({
    isOpen: false,
    title: '',
    documentType: 'GRN',
    data: null
  });

  const handleOpenPrint = (
    documentType: 'GRN' | 'PICK_LIST' | 'SHIPPING_LABEL' | 'BIN_LABELS' | 'AUDIT_CERT',
    data: any
  ) => {
    let title = 'Warehouse Document';
    if (documentType === 'GRN') title = 'Goods Received Note (GRN)';
    if (documentType === 'PICK_LIST') title = 'Outbound Wave Pick List';
    if (documentType === 'SHIPPING_LABEL') title = 'Carrier Shipping Label & Bill of Lading';
    if (documentType === 'BIN_LABELS') title = 'Location Bin Barcode Sheet';
    if (documentType === 'AUDIT_CERT') title = 'Cryptographic Audit Certificate';

    setPrintModalState({
      isOpen: true,
      title,
      documentType,
      data
    });
  };

  const handleGlobalScan = (barcode: string) => {
    console.log('Global scan received:', barcode);
  };

  // Keyboard shortcut for scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsScannerOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        onOpenScanner={() => setIsScannerOpen(true)} 
        onOpenSupabase={() => setIsSupabaseOpen(true)}
        onNavigate={setCurrentTab}
      />

      {/* Main Body with Sidebar + View Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
            {currentTab === 'company' && <CompanyView />}
            {currentTab === 'rbac' && <RbacView />}
            {currentTab === 'inventory' && <InventoryView onOpenPrint={handleOpenPrint} />}
            {currentTab === 'receiving' && <ReceivingView onOpenScanner={() => setIsScannerOpen(true)} onOpenPrint={handleOpenPrint} />}
            {currentTab === 'putaway' && <PutawayView onOpenScanner={() => setIsScannerOpen(true)} />}
            {currentTab === 'picking' && <PickingView onOpenScanner={() => setIsScannerOpen(true)} onOpenPrint={handleOpenPrint} />}
            {currentTab === 'dispatch' && <DispatchView onOpenPrint={handleOpenPrint} />}
            {currentTab === 'returns' && <ReturnsView />}
            {currentTab === 'audit' && <AuditView onOpenPrint={handleOpenPrint} />}
            {currentTab === 'billing' && <BillingView />}
          </div>
        </main>
      </div>

      {/* Virtual Barcode Scanner Modal */}
      <VirtualScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleGlobalScan}
      />

      {/* Supabase Database Cloud Sync Modal */}
      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
      />

      {/* Printable Document Modal */}
      <PrintModal
        isOpen={printModalState.isOpen}
        onClose={() => setPrintModalState(prev => ({ ...prev, isOpen: false }))}
        title={printModalState.title}
        documentType={printModalState.documentType}
        data={printModalState.data}
      />
    </div>
  );
};

export default function App() {
  return (
    <WarehouseProvider>
      <MainLayout />
    </WarehouseProvider>
  );
}
