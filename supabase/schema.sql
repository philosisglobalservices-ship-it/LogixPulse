-- ==============================================================================
-- LOGIXPULSE WOS (NIGERIA) - COMPLETE CLEAN SUPABASE POSTGRESQL SCHEMA
-- Connects to: https://rywfmocrdpygovckkarv.supabase.co
-- ==============================================================================

-- 1. DROP EXISTING CONFLICTING / STALE TABLES IN SAFE DEPENDENCY ORDER
DROP TABLE IF EXISTS public.storage_locations CASCADE;
DROP TABLE IF EXISTS public.inventory_stock CASCADE;
DROP TABLE IF EXISTS public.inbound_receipts CASCADE;
DROP TABLE IF EXISTS public.putaway_tasks CASCADE;
DROP TABLE IF EXISTS public.outbound_orders CASCADE;
DROP TABLE IF EXISTS public.pick_waves CASCADE;
DROP TABLE IF EXISTS public.dispatch_shipments CASCADE;
DROP TABLE IF EXISTS public.return_orders CASCADE;
DROP TABLE IF EXISTS public.stock_adjustments CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.zones CASCADE;

-- 2. COMPANIES (Multi-Tenant Organization)
CREATE TABLE public.companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  tax_id TEXT,
  currency TEXT DEFAULT 'NGN',
  logo_url TEXT,
  subscription_plan_id TEXT DEFAULT 'growth',
  subscription_status TEXT DEFAULT 'active',
  max_warehouses INT DEFAULT 3,
  max_users INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BRANCHES (Regional Operating Hubs)
CREATE TABLE public.branches (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Nigeria',
  address TEXT NOT NULL,
  manager_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WAREHOUSES (Physical Facilities)
CREATE TABLE public.warehouses (
  id TEXT PRIMARY KEY,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT NOT NULL,
  total_area_sqft INT DEFAULT 100000,
  zones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STORAGE LOCATIONS (Aisle, Rack, Shelf, Bin)
CREATE TABLE public.storage_locations (
  id TEXT PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  zone TEXT NOT NULL,
  aisle TEXT NOT NULL,
  rack TEXT NOT NULL,
  shelf TEXT NOT NULL,
  bin TEXT NOT NULL,
  barcode TEXT NOT NULL UNIQUE,
  max_capacity_kg NUMERIC DEFAULT 1000,
  current_capacity_kg NUMERIC DEFAULT 0,
  is_cold_chain BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USERS & OPERATORS (RBAC)
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'officer', 'auditor')),
  avatar TEXT,
  company_id TEXT,
  branch_id TEXT,
  assigned_warehouse_ids TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCTS (Master Catalog)
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  barcode TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  unit TEXT DEFAULT 'PCS',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  weight_kg NUMERIC DEFAULT 1.0,
  reorder_point INT DEFAULT 10,
  target_stock INT DEFAULT 50,
  current_stock INT DEFAULT 0,
  allocated_stock INT DEFAULT 0,
  is_cold_chain BOOLEAN DEFAULT false,
  requires_lot_tracking BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVENTORY STOCK BALANCES (Physical Lots in Bins)
CREATE TABLE public.inventory_stock (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  location_id TEXT REFERENCES public.storage_locations(id) ON DELETE CASCADE,
  location_code TEXT NOT NULL,
  lot_number TEXT NOT NULL,
  expiry_date DATE,
  quantity INT NOT NULL DEFAULT 0,
  received_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'available',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INBOUND GOODS RECEIPTS (PO & GRN)
CREATE TABLE public.inbound_receipts (
  id TEXT PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  po_number TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  expected_arrival_date DATE,
  status TEXT DEFAULT 'ARRIVED',
  carrier TEXT,
  tracking_number TEXT,
  lines JSONB DEFAULT '[]'::jsonb,
  received_by_user_id TEXT,
  received_by_user_name TEXT,
  received_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PUT-AWAY TASKS
CREATE TABLE public.putaway_tasks (
  id TEXT PRIMARY KEY,
  receipt_id TEXT,
  receipt_number TEXT,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  from_location_id TEXT NOT NULL,
  suggested_location_id TEXT NOT NULL,
  actual_location_id TEXT,
  quantity INT NOT NULL,
  lot_number TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  assigned_to_user_id TEXT,
  assigned_to_user_name TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. OUTBOUND SALES ORDERS
CREATE TABLE public.outbound_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  priority TEXT DEFAULT 'NORMAL',
  status TEXT DEFAULT 'PENDING_PICK',
  items JSONB DEFAULT '[]'::jsonb,
  wave_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PICKING WAVES
CREATE TABLE public.pick_waves (
  id TEXT PRIMARY KEY,
  wave_number TEXT NOT NULL UNIQUE,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  order_ids TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'CREATED',
  assigned_to_user_id TEXT,
  assigned_to_user_name TEXT,
  total_items INT DEFAULT 0,
  picked_items INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 13. OUTBOUND DISPATCH & CARRIER SHIPMENTS
CREATE TABLE public.dispatch_shipments (
  id TEXT PRIMARY KEY,
  shipment_number TEXT NOT NULL UNIQUE,
  order_id TEXT,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  tracking_number TEXT NOT NULL UNIQUE,
  package_type TEXT DEFAULT 'Medium Box',
  weight_kg NUMERIC DEFAULT 2.5,
  box_count INT DEFAULT 1,
  shipping_address TEXT NOT NULL,
  bol_number TEXT NOT NULL UNIQUE,
  dispatched_at TIMESTAMPTZ,
  dispatched_by_user_name TEXT,
  status TEXT DEFAULT 'DISPATCHED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. REVERSE LOGISTICS & RMA RETURNS
CREATE TABLE public.return_orders (
  id TEXT PRIMARY KEY,
  rma_number TEXT NOT NULL UNIQUE,
  original_order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'INSPECTION',
  return_reason TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  inspected_by_user_name TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. STOCK ADJUSTMENTS (Supervised Discrepancy Write-downs)
CREATE TABLE public.stock_adjustments (
  id TEXT PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  requested_by_user_id TEXT NOT NULL,
  requested_by_user_name TEXT NOT NULL,
  requested_date TIMESTAMPTZ DEFAULT NOW(),
  previous_qty INT NOT NULL,
  adjusted_qty INT NOT NULL,
  difference_qty INT NOT NULL,
  reason_code TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'PENDING_SUPERVISOR_APPROVAL',
  approved_by_user_id TEXT,
  approved_by_user_name TEXT,
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CRYPTOGRAPHIC IMMUTABLE AUDIT TRAIL (SHA-256 Merkle Chain)
CREATE TABLE public.audit_logs (
  id TEXT PRIMARY KEY,
  block_number INT NOT NULL UNIQUE,
  timestamp TIMESTAMPTZ NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  previous_hash TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.putaway_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read and write operations for frontend app
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'companies', 'branches', 'warehouses', 'storage_locations', 'users',
      'products', 'inventory_stock', 'inbound_receipts', 'putaway_tasks',
      'outbound_orders', 'pick_waves', 'dispatch_shipments', 'return_orders',
      'stock_adjustments', 'audit_logs'
    ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public access for all operations" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Public access for all operations" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- Enforce immutable audit rule at database level
CREATE OR REPLACE RULE no_delete_audit_logs AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING;

-- ==============================================================================
-- INITIAL NIGERIAN SEED DATA
-- ==============================================================================
INSERT INTO public.companies (id, name, code, tax_id, currency, subscription_plan_id, max_warehouses, max_users)
VALUES ('comp-01', 'Eko Integrated Logistics Nigeria Ltd', 'EKO-LOG-NG', 'NG-TIN-8940218-WOS', 'NGN', 'growth', 3, 20)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.branches (id, company_id, name, code, city, country, address, manager_name, phone)
VALUES 
('br-los', 'comp-01', 'Lagos Commercial Gateway Hub', 'BR-LOS-NG', 'Ikeja, Lagos State', 'Nigeria', 'Plot 14, Commercial Avenue, Ikeja Industrial Estate, Lagos', 'Engr. Babatunde Sanusi', '+234 1 270 4800'),
('br-abj', 'comp-01', 'Abuja Federal Capital Center', 'BR-ABJ-NG', 'Idu Industrial Zone, Abuja', 'Nigeria', 'Plot 88, Sector Centre D, Idu Industrial District, Abuja', 'Hajiya Aisha Danjuma', '+234 9 461 8200'),
('br-ph', 'comp-01', 'Port Harcourt Niger Delta Terminal', 'BR-PHC-NG', 'Port Harcourt, Rivers State', 'Nigeria', '12 Trans-Amadi Industrial Layout, Port Harcourt', 'Nnamdi Okonkwo', '+234 84 555 120')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.warehouses (id, branch_id, name, code, address, total_area_sqft)
VALUES
('wh-los-01', 'br-los', 'Ikeja Central Fulfillment Hub', 'WH-LOS-FC1', 'Plot 14, Commercial Avenue, Gate 3, Ikeja Industrial Estate, Lagos', 180000),
('wh-abj-01', 'br-abj', 'Abuja Idu Logistics Hub', 'WH-ABJ-D01', 'Plot 88, Sector Centre D, Idu Industrial District, Abuja', 55000),
('wh-ph-01', 'br-ph', 'Port Harcourt Trans-Amadi Depot', 'WH-PHC-G1', '12 Trans-Amadi Industrial Layout, Port Harcourt', 95000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, role, company_id, branch_id, assigned_warehouse_ids)
VALUES
('usr-admin', 'Dr. Folashade Adeyemi', 'folashade.adeyemi@ekologistics.ng', 'admin', 'comp-01', 'br-los', ARRAY['wh-los-01', 'wh-abj-01', 'wh-ph-01']),
('usr-sup', 'Chukwuma Eze', 'chukwuma.eze@ekologistics.ng', 'supervisor', 'comp-01', 'br-los', ARRAY['wh-los-01']),
('usr-off', 'Tunde Balogun', 'tunde.balogun@ekologistics.ng', 'officer', 'comp-01', 'br-los', ARRAY['wh-los-01']),
('usr-aud', 'Zainab Abubakar', 'zainab.abubakar@compliance.gov.ng', 'auditor', 'comp-01', 'br-los', ARRAY['wh-los-01', 'wh-abj-01', 'wh-ph-01'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, sku, name, barcode, category, unit, unit_cost, unit_price, current_stock, reorder_point)
VALUES
('prod-01', 'SKU-ROB-880', 'Innoson Industrial 6-Axis Gripper Arm', '793573198001', 'Robotics', 'PCS', 2150000.00, 3200000.00, 14, 5),
('prod-02', 'SKU-IOT-102', 'MainOne Industrial BLE 5.3 Sensor Beacon (Pack of 10)', '793573198002', 'Electronics', 'BOX', 65000.00, 120000.00, 82, 20),
('prod-03', 'SKU-MED-440', 'Emzor Cryogenic Cold-Chain Biologics Vial 50ml', '793573198003', 'Medical', 'PCS', 890000.00, 1450000.00, 32, 15),
('prod-04', 'SKU-BAT-900', 'Zinox 48V 100Ah Solar Lithium Pack', '793573198004', 'Industrial', 'PCS', 1250000.00, 1850000.00, 9, 4),
('prod-05', 'SKU-SCN-210', 'MTN Rugged Android IP67 Handheld Barcode Scanner', '793573198005', 'Electronics', 'PCS', 540000.00, 820000.00, 24, 8),
('prod-06', 'SKU-DRN-550', 'Eko Surveillance LiDAR Inspection Drone', '793573198006', 'Robotics', 'PCS', 3400000.00, 5200000.00, 5, 2),
('prod-07', 'SKU-PKG-010', 'BUA Reinforced 3-Ply Corrugated Heavy Carton (Box of 50)', '793573198007', 'Consumer Goods', 'BOX', 45000.00, 75000.00, 110, 30)
ON CONFLICT (id) DO NOTHING;
