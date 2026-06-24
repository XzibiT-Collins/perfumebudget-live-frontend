import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Inbox, ShoppingBag, Globe } from 'lucide-react';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Checkbox } from '../components/Checkbox';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import locationInventoryService from '../services/locationInventoryService';
import type {
  StorageLocationResponse,
  StorageLocationRequest,
  StorageLocationType,
  StorageLocationDefaultsRequest,
} from '../types';
import { extractErrorMessage } from '../utils';
import toast from 'react-hot-toast';

type RoleKey = keyof StorageLocationDefaultsRequest;

interface RoleMeta {
  key: RoleKey;
  flag: keyof StorageLocationResponse;
  label: string;
  icon: typeof Inbox;
}

const ROLES: RoleMeta[] = [
  { key: 'isDefaultReceiving', flag: 'isDefaultReceiving', label: 'Receiving', icon: Inbox },
  { key: 'isWalkInSaleSource', flag: 'isWalkInSaleSource', label: 'Walk-in', icon: ShoppingBag },
  { key: 'isEcommerceFulfilmentSource', flag: 'isEcommerceFulfilmentSource', label: 'E-com', icon: Globe },
];

const THRESHOLD_HELP =
  "Restock alert threshold — alert staff when shop-floor quantity falls to this level (leave empty to use each product's own threshold)";

const holdsAnyRole = (loc: StorageLocationResponse) =>
  loc.isDefaultReceiving || loc.isWalkInSaleSource || loc.isEcommerceFulfilmentSource;

export const StorageLocationManagement = () => {
  const [locations, setLocations] = useState<StorageLocationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<StorageLocationResponse | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<StorageLocationType>('STORE_ROOM');
  const [threshold, setThreshold] = useState('');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Default-role move confirmation
  const [pendingDefault, setPendingDefault] = useState<{ loc: StorageLocationResponse; role: RoleMeta } | null>(null);
  const [isApplyingDefault, setIsApplyingDefault] = useState(false);

  const load = () => {
    setIsLoading(true);
    locationInventoryService
      .getLocations()
      .then(setLocations)
      .catch((err) => toast.error(extractErrorMessage(err, 'Failed to load storage locations')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setType('STORE_ROOM');
    setThreshold('');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (loc: StorageLocationResponse) => {
    setEditing(loc);
    setName(loc.name);
    setType(loc.type);
    setThreshold(loc.lowStockThreshold != null ? String(loc.lowStockThreshold) : '');
    setActive(loc.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Location name is required');
      return;
    }
    if (trimmed.length > 128) {
      toast.error('Location name must be 128 characters or fewer');
      return;
    }

    let thresholdValue: number | null = null;
    if (type === 'SHOP_FLOOR' && threshold.trim() !== '') {
      const parsed = Number(threshold);
      if (isNaN(parsed) || parsed < 0) {
        toast.error('Restock alert threshold must be 0 or greater');
        return;
      }
      thresholdValue = parsed;
    }

    // Client-side guard: cannot deactivate a location that holds a default role.
    if (editing && !active && holdsAnyRole(editing)) {
      toast.error(
        'Cannot deactivate a location that is a default receiving or sale source. Reassign the defaults first (click a role chip on another location).'
      );
      return;
    }

    const payload: StorageLocationRequest = {
      name: trimmed,
      type,
      lowStockThreshold: thresholdValue,
      active,
    };

    setIsSaving(true);
    try {
      if (editing) {
        await locationInventoryService.updateLocation(editing.id, payload);
        toast.success('Storage location updated');
      } else {
        await locationInventoryService.createLocation(payload);
        toast.success('Storage location created');
      }
      setIsModalOpen(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save storage location'));
    } finally {
      setIsSaving(false);
    }
  };

  const applyDefault = async () => {
    if (!pendingDefault) return;
    setIsApplyingDefault(true);
    try {
      await locationInventoryService.setLocationDefaults(pendingDefault.loc.id, {
        [pendingDefault.role.key]: true,
      } as StorageLocationDefaultsRequest);
      toast.success(`${pendingDefault.role.label} role moved to ${pendingDefault.loc.name}`);
      setPendingDefault(null);
      load(); // re-fetch: previous holder's flag was cleared server-side
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to move default role'));
    } finally {
      setIsApplyingDefault(false);
    }
  };

  const requestDefault = (loc: StorageLocationResponse, role: RoleMeta) => {
    if (loc[role.flag]) return; // already holds it
    if (!loc.active) {
      toast.error('Activate this location before assigning a default role to it.');
      return;
    }
    setPendingDefault({ loc, role });
  };

  const columns = [
    {
      header: 'Name',
      accessor: (loc: StorageLocationResponse) => (
        <span className="font-semibold text-[#1A1A1A] dark:text-white">{loc.name}</span>
      ),
    },
    {
      header: 'Type',
      accessor: (loc: StorageLocationResponse) => (
        <Badge variant={loc.type === 'SHOP_FLOOR' ? 'info' : 'default'}>
          {loc.type === 'SHOP_FLOOR' ? 'Shop Floor' : 'Store Room'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (loc: StorageLocationResponse) => (
        <Badge variant={loc.active ? 'success' : 'default'}>{loc.active ? 'Active' : 'Inactive'}</Badge>
      ),
    },
    {
      header: 'Threshold',
      accessor: (loc: StorageLocationResponse) =>
        loc.type === 'SHOP_FLOOR' ? (loc.lowStockThreshold != null ? loc.lowStockThreshold : 'Product default') : '—',
    },
    {
      header: 'Default Roles',
      accessor: (loc: StorageLocationResponse) => (
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((role) => {
            const held = Boolean(loc[role.flag]);
            return (
              <button
                key={role.key}
                type="button"
                title={held ? `${role.label} happens here` : `Move ${role.label} role to ${loc.name}`}
                onClick={() => requestDefault(loc, role)}
                disabled={held}
                className="focus:outline-none"
              >
                <Badge
                  variant={held ? 'secondary' : 'default'}
                  className={held ? '' : 'opacity-50 hover:opacity-90 cursor-pointer transition-opacity'}
                >
                  <role.icon className="h-3 w-3 mr-1" />
                  {role.label}
                </Badge>
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Storage Locations</h1>
        <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">
          Manage where stock physically sits. Click a role chip to move the receiving, walk-in, or e-commerce
          default to that location.
        </p>
      </div>

      <AdminTable
        title="Locations"
        data={locations}
        columns={columns}
        onAdd={openCreate}
        onEdit={openEdit}
        isLoading={isLoading}
        itemsPerPage={10}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Storage Location' : 'New Storage Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={128}
            placeholder="e.g. Store Room 2"
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400 mb-1.5">
              Type
            </label>
            <Dropdown
              value={type}
              onChange={(val) => setType(val as StorageLocationType)}
              options={[
                { label: 'Store Room', value: 'STORE_ROOM' },
                { label: 'Shop Floor', value: 'SHOP_FLOOR' },
              ]}
            />
          </div>

          {type === 'SHOP_FLOOR' && (
            <div>
              <Input
                label="Restock Alert Threshold"
                type="number"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="Leave empty to use product default"
              />
              <p className="text-[11px] text-[#999999] mt-1.5 leading-relaxed">{THRESHOLD_HELP}</p>
            </div>
          )}

          <div className="pt-1">
            <Checkbox
              checked={active}
              onChange={setActive}
              label="Active"
              description="Inactive locations cannot receive transfers or hold default roles."
            />
            {editing && holdsAnyRole(editing) && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 leading-relaxed">
                This location currently holds a default role. Move that role to another location before
                deactivating it.
              </p>
            )}
          </div>

          <Button type="submit" isLoading={isSaving} className="w-full h-12 rounded-2xl">
            {editing ? 'Save Changes' : 'Create Location'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={pendingDefault !== null}
        onClose={() => setPendingDefault(null)}
        onConfirm={applyDefault}
        isDestructive={false}
        title="Move Default Role"
        confirmLabel="Move Role"
        isLoading={isApplyingDefault}
        message={
          pendingDefault ? (
            <>
              Move the <strong>{pendingDefault.role.label}</strong> default to{' '}
              <strong>{pendingDefault.loc.name}</strong>? The location currently holding this role will lose
              it.
            </>
          ) : (
            ''
          )
        }
      />
    </motion.div>
  );
};
