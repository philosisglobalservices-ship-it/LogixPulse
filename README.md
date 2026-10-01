# LogixPulse WOS — Cloud Enterprise Warehouse Operating System (Nigeria)

A modern, cloud-native **Warehouse Operating System (WOS)** built for Nigerian logistics and industrial supply chain operations, replacing manual spreadsheets, paper ledgers, and WhatsApp coordination with an audited, role-governed execution platform.

---

## ⚡ Live Supabase Cloud Database Integration

This project is connected directly to your remote Supabase PostgreSQL database:

* **Supabase Project URL**: `https://rywfmocrdpygovckkarv.supabase.co`
* **Publishable / Anon Key**: `sb_publishable_RnXmOfUXRS7D0kWz1jEJIQ_svXPD_JV`
* **Client Library**: `@supabase/supabase-js` in [`src/lib/supabase.ts`](file:///c:/Users/User/Desktop/Warehouse%20Operation/src/lib/supabase.ts)
* **SQL Schema Migration Script**: [`supabase/schema.sql`](file:///c:/Users/User/Desktop/Warehouse%20Operation/supabase/schema.sql)
* **Interactive Cloud Modal**: Accessible directly inside the app by clicking the glowing **Supabase** button in the top navigation bar. Allows testing database latency, checking connection status, copying PostgreSQL DDL statements, and pushing warehouse inventory records to the cloud.

---

## 🏛️ System Architecture & Nigerian Operational Hierarchy

The system hierarchy is configured strictly according to the enterprise specification:

```
Company (Eko Integrated Logistics Nigeria Ltd • RC / TIN: NG-TIN-8940218-WOS)
   ↓
Branches (Lagos Commercial Hub • Abuja Federal Gateway • Port Harcourt Terminal)
   ↓
Warehouses (Ikeja Central FC • Abuja Idu Logistics Hub • Port Harcourt Trans-Amadi Depot)
   ↓
Users (Assigned warehouse operators, supervisors, and compliance auditors)
   ↓
Roles & Permissions (Strict RBAC separation of duties)
   ↓
Inventory (Master Catalog, Multi-Bin Balances in ₦ Naira, Lot Expiry, Supervised Adjustments)
   ↓
Receiving (Inbound Purchase Orders, Damage Inspection, Official GRN, Staging)
   ↓
Put-away (System-Directed Smart Velocity / Cold Storage Routing & Verification)
   ↓
Picking (Sales Orders, Wave / Batch Generation, Optimal Aisle-Sequence Path)
   ↓
Dispatch (Packing Workbench, Tare Scale, Nigerian Carrier Manifest: GIGL / Red Star / DHL / Kwik)
   ↓
Returns (RMA Intake, Quality Grading A/B/C/D, Quarantine vs Restock Routing)
   ↓
Reports & Audit (Cryptographic SHA-256 Merkle Chain Integrity Verification)
```

---

## 🛡️ Key Differentiators & Nigerian Personas

### 1. First-Class RBAC (Role-Based Access Control)
* **Tunde Balogun** — *Warehouse Officer* (Frontline Operations):
  * ✅ Can scan barcodes, receive stock, execute putaway, pick waves, pack, and request inventory discrepancy adjustments.
  * ❌ **CANNOT approve stock adjustments** (Strictly blocked by RBAC gate).
* **Chukwuma Eze** — *Warehouse Supervisor* (Floor Leadership):
  * ✅ Can plan waves, manage floor operations, and **approve/reject stock count discrepancies**.
  * ❌ **CANNOT change company financial/billing settings or subscription plans**.
* **Dr. Folashade Adeyemi** — *System Administrator* (Corporate Executive):
  * ✅ Can manage users, facilities, branches, and corporate billing.
  * ❌ **CANNOT secretly delete or tamper with transaction history** (Ledger is cryptographically append-only).
* **Zainab Abubakar** — *Compliance Auditor* (Independent Regulatory Oversight):
  * ✅ Read-only access across all operational ledgers with SHA-256 blockchain verification authority.

### 2. Nigerian Enterprise Ecosystem Integration
* **Carriers**: GIG Logistics (GIGL), Red Star Express (FedEx Nigeria), DHL Express Nigeria, Kwik Delivery Fleet.
* **Corporate Clients**: Dangote Cement & Infrastructure Plc, Emzor Pharmaceuticals Industries Ltd, Flutterwave Technology Hub, BUA Foods Plc, Oando Clean Energy Ltd, Innoson Vehicle Manufacturing (IVM).
* **Technology Suppliers**: MainOne Cable & Data Systems Ltd, Zinox Technologies Group.
* **Currency**: Nigerian Naira (₦).

---

## 🚀 Running the Application

The web application is live and accessible locally at:
```
http://localhost:3000/
```

### Development Commands
```powershell
# Run development server
npm.cmd run dev

# Run TypeScript compilation & production build
npm.cmd run build

# Preview production build
npm.cmd run preview
```
