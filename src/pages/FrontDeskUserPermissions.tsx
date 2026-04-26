import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Badge } from '../components/Badge';
import { frontDeskService } from '../services/frontDeskService';
import { FrontDeskPermission, FrontDeskUserPermissionsResponse } from '../types';
import toast from 'react-hot-toast';
import { Key, Save, ArrowLeft, Shield, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { extractErrorMessage } from '../utils';

export const FrontDeskUserPermissions = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<FrontDeskUserPermissionsResponse | null>(null);
  const [allowedOverrides, setAllowedOverrides] = useState<FrontDeskPermission[]>([]);
  const [deniedOverrides, setDeniedOverrides] = useState<FrontDeskPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userId) fetchPermissions();
  }, [userId]);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const res = await frontDeskService.getUserPermissions(Number(userId));
      setData(res);
      setAllowedOverrides(res.allowedOverrides);
      setDeniedOverrides(res.deniedOverrides);
    } catch (err) {
      toast.error('Failed to load user permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOverride = (permission: FrontDeskPermission, type: 'ALLOW' | 'DENY') => {
    if (type === 'ALLOW') {
      if (allowedOverrides.includes(permission)) {
        setAllowedOverrides(prev => prev.filter(p => p !== permission));
      } else {
        setAllowedOverrides(prev => [...prev, permission]);
        setDeniedOverrides(prev => prev.filter(p => p !== permission));
      }
    } else {
      if (deniedOverrides.includes(permission)) {
        setDeniedOverrides(prev => prev.filter(p => p !== permission));
      } else {
        setDeniedOverrides(prev => [...prev, permission]);
        setAllowedOverrides(prev => prev.filter(p => p !== permission));
      }
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await frontDeskService.updateUserPermissions(Number(userId), {
        allowedPermissions: allowedOverrides,
        deniedPermissions: deniedOverrides
      });
      toast.success('User overrides updated successfully');
      navigate('/admin/front-desk');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to save overrides'));
    } finally {
      setIsSaving(false);
    }
  };

  const permissionLabels: Record<FrontDeskPermission, string> = {
    [FrontDeskPermission.WALK_IN_ORDER_CREATE]: 'Create Walk-In Orders',
    [FrontDeskPermission.WALK_IN_ORDER_VIEW]: 'View Walk-In Orders',
    [FrontDeskPermission.WALK_IN_ORDER_MARK_RECEIPT_PRINTED]: 'Mark Receipt Printed',
    [FrontDeskPermission.CUSTOMER_SEARCH]: 'Search Registered Customers',
    [FrontDeskPermission.PRODUCT_VIEW_ADMIN_CATALOG]: 'View Admin Catalog',
    [FrontDeskPermission.PRODUCT_VIEW_STOCK_SUMMARY]: 'View Stock Summary',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/front-desk')}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 dark:text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">User Permissions</h1>
            <p className="text-sm text-zinc-500 mt-1">Configure specific overrides for this staff member.</p>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Overrides
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 bg-white dark:bg-zinc-900 rounded-[2.5rem] animate-pulse" />
      ) : data && (
        <div className="grid gap-8">
          {/* Legend / Summary */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-[#F5F5F5] dark:border-zinc-800 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#999999]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">Role Policy</p>
                <p className="text-sm font-bold dark:text-white">Default Template</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-accent-dark" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">Explicitly Allowed</p>
                <p className="text-sm font-bold dark:text-white">User Override</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">Explicitly Denied</p>
                <p className="text-sm font-bold dark:text-white">User Override</p>
              </div>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-[#F5F5F5] dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-[#F5F5F5] dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#999999]">Permission</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-[#999999] text-center">Template</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-[#999999] text-center">Override: Allow</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-[#999999] text-center">Override: Deny</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#999999] text-right">Effective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5] dark:divide-zinc-800">
                {(Object.keys(FrontDeskPermission) as FrontDeskPermission[]).map((perm) => {
                  const isFromTemplate = data.templatePermissions.includes(perm);
                  const isAllowed = allowedOverrides.includes(perm);
                  const isDenied = deniedOverrides.includes(perm);
                  const isEffective = (isFromTemplate || isAllowed) && !isDenied;

                  return (
                    <tr key={perm} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm dark:text-white">{permissionLabels[perm] || perm}</p>
                        <p className="text-[10px] text-[#999999] uppercase tracking-wider">{perm}</p>
                      </td>
                      <td className="px-4 py-6 text-center">
                        {isFromTemplate ? (
                          <div className="flex justify-center">
                            <CheckCircle2 className="h-5 w-5 text-zinc-300" />
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <XCircle className="h-5 w-5 text-zinc-100 dark:text-zinc-800" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex justify-center">
                          <Checkbox 
                            checked={isAllowed} 
                            onChange={() => toggleOverride(perm, 'ALLOW')} 
                          />
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex justify-center">
                          <Checkbox 
                            checked={isDenied} 
                            onChange={() => toggleOverride(perm, 'DENY')} 
                          />
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Badge variant={isEffective ? 'success' : 'default'}>
                          {isEffective ? 'ENABLED' : 'DISABLED'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl p-8 border border-dashed border-[#E5E5E5] dark:border-zinc-800 flex gap-4">
            <AlertCircle className="h-5 w-5 text-accent-dark flex-shrink-0" />
            <p className="text-sm text-[#666666] dark:text-zinc-400 leading-relaxed">
              Overrides take precedence over the default template. An <span className="font-bold text-accent-dark dark:text-accent">Explicit Deny</span> will block a permission even if it's enabled in the template. An <span className="font-bold text-accent-dark dark:text-accent">Explicit Allow</span> will enable it even if it's disabled in the template.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
