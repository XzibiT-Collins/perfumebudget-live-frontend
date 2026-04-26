import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { frontDeskService } from '../services/frontDeskService';
import { FrontDeskPermission } from '../types';
import toast from 'react-hot-toast';
import { Settings, Save, ArrowLeft, Shield } from 'lucide-react';
import { extractErrorMessage } from '../utils';

export const FrontDeskTemplate = () => {
  const navigate = useNavigate();
  const [selectedPermissions, setSelectedPermissions] = useState<FrontDeskPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    setIsLoading(true);
    try {
      const data = await frontDeskService.getDefaultTemplate();
      setSelectedPermissions(data.permissions);
    } catch (err) {
      toast.error('Failed to load default template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (permission: FrontDeskPermission) => {
    setSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await frontDeskService.updateDefaultTemplate({ permissions: selectedPermissions });
      toast.success('Default template updated successfully');
      navigate('/admin/front-desk');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to save template'));
    } finally {
      setIsSaving(false);
    }
  };

  const permissionLabels: Record<FrontDeskPermission, { label: string, desc: string }> = {
    [FrontDeskPermission.WALK_IN_ORDER_CREATE]: { 
      label: 'Create Walk-In Orders', 
      desc: 'Allows staff to process sales and create new walk-in orders.' 
    },
    [FrontDeskPermission.WALK_IN_ORDER_VIEW]: { 
      label: 'View Walk-In Orders', 
      desc: 'Allows staff to view the list and details of walk-in orders.' 
    },
    [FrontDeskPermission.WALK_IN_ORDER_MARK_RECEIPT_PRINTED]: { 
      label: 'Mark Receipt Printed', 
      desc: 'Allows staff to update the receipt printing status of an order.' 
    },
    [FrontDeskPermission.CUSTOMER_SEARCH]: { 
      label: 'Search Registered Customers', 
      desc: 'Allows staff to lookup existing customers by name, email or phone.' 
    },
    [FrontDeskPermission.PRODUCT_VIEW_ADMIN_CATALOG]: { 
      label: 'View Admin Catalog', 
      desc: 'Allows staff to browse the full product catalog with internal details.' 
    },
    [FrontDeskPermission.PRODUCT_VIEW_STOCK_SUMMARY]: { 
      label: 'View Stock Summary', 
      desc: 'Allows staff to see current stock levels across all products.' 
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/front-desk')}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 dark:text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Default Permissions</h1>
            <p className="text-sm text-zinc-500 mt-1">Set the baseline permissions for all front desk staff.</p>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-[#F5F5F5] dark:border-zinc-800">
        <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent" />
          Baseline Permissions
        </h2>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-zinc-50 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {(Object.keys(FrontDeskPermission) as FrontDeskPermission[]).map((perm) => (
              <div 
                key={perm}
                onClick={() => handleToggle(perm)}
                className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedPermissions.includes(perm)
                    ? 'border-accent bg-accent/5 dark:bg-accent/10'
                    : 'border-[#F5F5F5] dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-bold dark:text-white">{permissionLabels[perm]?.label || perm}</h3>
                  <p className="text-sm text-[#999999] mt-1">{permissionLabels[perm]?.desc}</p>
                </div>
                <Checkbox 
                  checked={selectedPermissions.includes(perm)} 
                  onChange={() => handleToggle(perm)} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl p-8 border border-dashed border-[#E5E5E5] dark:border-zinc-800">
        <p className="text-sm text-[#666666] dark:text-zinc-400 leading-relaxed">
          <span className="font-bold text-accent-dark dark:text-accent">Note:</span> These permissions are applied to all staff members whose roles are set to Front Desk, unless they have specific user-level overrides. Changing the template will immediately affect all such users.
        </p>
      </div>
    </div>
  );
};
