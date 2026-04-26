import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, User, Save, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { featureFlagService } from '../services/featureFlagService';
import { Checkbox } from '../components/Checkbox';
import type { FeatureFlagResponse } from '../types';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils';

export const FeatureFlagManagement = () => {
    const [flags, setFlags] = useState<FeatureFlagResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    useEffect(() => {
        loadFlags();
    }, []);

    const loadFlags = async () => {
        setIsLoading(true);
        try {
            const data = await featureFlagService.getFeatureFlags();
            setFlags(data);
        } catch (err: any) {
            toast.error(extractErrorMessage(err, 'Failed to load feature flags'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (flag: FeatureFlagResponse, adminEnabled: boolean, frontDeskEnabled: boolean, customerEnabled: boolean) => {
        setIsSaving(flag.featureKey);
        try {
            const updated = await featureFlagService.updateFeatureFlag(flag.featureKey, {
                adminEnabled,
                frontDeskEnabled,
                customerEnabled
            });
            setFlags(prev => prev.map(f => f.featureKey === updated.featureKey ? updated : f));
            toast.success(`${flag.featureKey} updated successfully`);
        } catch (err: any) {
            toast.error(extractErrorMessage(err, 'Failed to update flag'));
        } finally {
            setIsSaving(null);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">System Settings</h1>
                    <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">
                        Manage global feature flags and system behavior
                    </p>
                </div>
                <Button onClick={loadFlags} variant="outline" size="sm" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-32 bg-white dark:bg-zinc-900 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : flags.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-[#E5E5E5] dark:border-zinc-800">
                    <p className="text-[#666666] dark:text-zinc-400">No feature flags found.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {flags.map(flag => (
                        <motion.div
                            key={flag.featureKey}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-[#E5E5E5] dark:border-zinc-800"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold dark:text-white mb-1">{flag.featureKey}</h3>
                                    <p className="text-sm text-[#666666] dark:text-zinc-400 leading-relaxed">
                                        {flag.description}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 min-w-[200px]">
                                    <div className="flex items-center justify-between p-3 bg-[#F5F5F5] dark:bg-zinc-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
                                            <Shield className="h-3.5 w-3.5" /> Admins
                                        </div>
                                        <Checkbox
                                            checked={flag.adminEnabled}
                                            onChange={(val) => handleUpdate(flag, val, flag.frontDeskEnabled, flag.customerEnabled)}
                                            disabled={isSaving === flag.featureKey}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-[#F5F5F5] dark:bg-zinc-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
                                            <Shield className="h-3.5 w-3.5" /> Front Desk
                                        </div>
                                        <Checkbox
                                            checked={flag.frontDeskEnabled}
                                            onChange={(val) => handleUpdate(flag, flag.adminEnabled, val, flag.customerEnabled)}
                                            disabled={isSaving === flag.featureKey}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-[#F5F5F5] dark:bg-zinc-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
                                            <User className="h-3.5 w-3.5" /> Customers
                                        </div>
                                        <Checkbox
                                            checked={flag.customerEnabled}
                                            onChange={(val) => handleUpdate(flag, flag.adminEnabled, flag.frontDeskEnabled, val)}
                                            disabled={isSaving === flag.featureKey}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {isSaving === flag.featureKey && (
                                <div className="mt-4 flex items-center justify-center text-xs text-accent-dark font-medium gap-2">
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    Saving changes...
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
