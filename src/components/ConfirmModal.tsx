import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = true,
    isLoading = false,
}: ConfirmModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div className="flex items-start gap-4 text-[#666666] dark:text-zinc-400">
                    {isDestructive && (
                        <div className="flex-shrink-0 h-10 w-10 mt-1 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    )}
                    <p className="text-sm leading-relaxed">{message}</p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-[#F5F5F5] dark:border-zinc-800">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        className={`flex-1 ${isDestructive ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700' : ''}`}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
