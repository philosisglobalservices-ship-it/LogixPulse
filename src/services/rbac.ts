import { RoleType } from '../types';

export type Permission =
  | 'company:view'
  | 'company:edit'
  | 'branch:manage'
  | 'warehouse:manage'
  | 'users:manage'
  | 'inventory:view'
  | 'inventory:create'
  | 'inventory:adjust_request'
  | 'inventory:adjust_approve'
  | 'receiving:view'
  | 'receiving:execute'
  | 'putaway:view'
  | 'putaway:execute'
  | 'picking:view'
  | 'picking:create_wave'
  | 'picking:execute'
  | 'dispatch:view'
  | 'dispatch:pack'
  | 'dispatch:ship'
  | 'returns:view'
  | 'returns:inspect'
  | 'returns:disposition'
  | 'audit:view'
  | 'audit:verify'
  | 'audit:delete' // NEVER GRANTED TO ANYONE!
  | 'billing:view'
  | 'billing:manage';

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  admin: [
    'company:view',
    'company:edit',
    'branch:manage',
    'warehouse:manage',
    'users:manage',
    'inventory:view',
    'inventory:create',
    'inventory:adjust_request',
    'inventory:adjust_approve',
    'receiving:view',
    'receiving:execute',
    'putaway:view',
    'putaway:execute',
    'picking:view',
    'picking:create_wave',
    'picking:execute',
    'dispatch:view',
    'dispatch:pack',
    'dispatch:ship',
    'returns:view',
    'returns:inspect',
    'returns:disposition',
    'audit:view',
    'audit:verify',
    // NOTICE: 'audit:delete' is intentionally absent! Even Admin cannot delete transaction history!
    'billing:view',
    'billing:manage'
  ],
  supervisor: [
    'company:view',
    'inventory:view',
    'inventory:create',
    'inventory:adjust_request',
    'inventory:adjust_approve', // CAN approve adjustments!
    'receiving:view',
    'receiving:execute',
    'putaway:view',
    'putaway:execute',
    'picking:view',
    'picking:create_wave',
    'picking:execute',
    'dispatch:view',
    'dispatch:pack',
    'dispatch:ship',
    'returns:view',
    'returns:inspect',
    'returns:disposition',
    'audit:view',
    'audit:verify'
    // CANNOT change financial/billing settings!
    // CANNOT manage users!
  ],
  officer: [
    'company:view',
    'inventory:view',
    'inventory:adjust_request', // CAN request adjustments
    // CANNOT approve adjustments! ('inventory:adjust_approve' is missing!)
    'receiving:view',
    'receiving:execute',
    'putaway:view',
    'putaway:execute',
    'picking:view',
    'picking:execute',
    'dispatch:view',
    'dispatch:pack',
    'dispatch:ship',
    'returns:view',
    'returns:inspect',
    'audit:view'
    // CANNOT touch billing, users, or approve stock write-downs
  ],
  auditor: [
    'company:view',
    'inventory:view',
    'receiving:view',
    'putaway:view',
    'picking:view',
    'dispatch:view',
    'returns:view',
    'audit:view',
    'audit:verify',
    'billing:view'
  ]
};

export const ROLE_LABELS: Record<RoleType, { title: string; badge: string; description: string; boundarySummary: string }> = {
  admin: {
    title: 'Administrator',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    description: 'Full organizational authority across companies, branches, warehouses, users, and billing.',
    boundarySummary: 'Can manage users & facilities, but CANNOT delete or tamper with transaction history (immutable audit trail).'
  },
  supervisor: {
    title: 'Warehouse Supervisor',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Floor leadership, wave planning, task assignment, quality control, and inventory discrepancy sign-off.',
    boundarySummary: 'Can approve stock adjustments, but CANNOT change financial/billing settings or delete audits.'
  },
  officer: {
    title: 'Warehouse Officer',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Frontline operations: inbound scanning, put-away routing, order picking, packaging, and dispatch.',
    boundarySummary: 'Can receive stock and request adjustments, but CANNOT approve stock adjustments.'
  },
  auditor: {
    title: 'Compliance Auditor',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Independent oversight, cryptographic hash verification, stock valuation, and regulatory reporting.',
    boundarySummary: 'Read-only access across all operational ledgers with SHA-256 block chain verification rights.'
  }
};

export function hasPermission(role: RoleType, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
