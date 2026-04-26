import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal = ({ isOpen, onClose, title, children, className, size = 'lg' }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[51] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "bg-white dark:bg-zinc-900 w-full rounded-[2.5rem] shadow-2xl pointer-events-auto overflow-hidden border dark:border-zinc-800",
                sizeClasses[size],
                className
              )}
            >
              <div className="px-8 py-6 border-b border-[#F5F5F5] dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold dark:text-white">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-[#666666] dark:text-zinc-400" />
                </button>
              </div>
              <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
