import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('resetPasswordToken') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isPasswordValid = passwordRequirements.every((r) => r.test(password));
    const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error('Please meet all password requirements');
            return;
        }
        if (!doPasswordsMatch) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(token, { password, confirmPassword });
            toast.success('Password reset successfully! Please sign in.');
            navigate('/login', { replace: true });
        } catch (err: any) {
            const message =
                err.response?.data?.description || 'Failed to reset password. The link may be expired.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Missing token — show error state
    if (!token) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-zinc-950 px-4"
            >
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold dark:text-white">Invalid Link</h1>
                        <p className="text-sm text-[#666666] dark:text-zinc-400 mt-2">
                            This password reset link is invalid or has expired.
                        </p>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow text-center space-y-4"
                    >
                        <p className="text-sm text-[#666666] dark:text-zinc-400">
                            Please request a new password reset link.
                        </p>
                        <Link to="/forgot-password">
                            <Button className="w-full h-12 rounded-2xl">
                                Request New Link
                            </Button>
                        </Link>
                        <p className="text-sm text-[#666666] dark:text-zinc-400">
                            <Link
                                to="/login"
                                className="font-bold text-[#1A1A1A] dark:text-white hover:underline"
                            >
                                Back to Sign In
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-zinc-950 px-4 py-12"
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="mx-auto w-16 h-16 bg-accent/20 dark:bg-accent/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-8 w-8 text-accent-dark" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold dark:text-white">Reset Password</h1>
                    <p className="text-sm text-[#666666] dark:text-zinc-400 mt-2">
                        Choose a strong new password for your account.
                    </p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <Input
                                label="New Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-9 text-[#999999] hover:text-[#666666]"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {/* Password requirements */}
                        {password.length > 0 && (
                            <div className="space-y-1.5">
                                {passwordRequirements.map((req) => {
                                    const met = req.test(password);
                                    return (
                                        <div key={req.label} className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-[#999999]'}`}>
                                            {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            {req.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="relative">
                            <Input
                                label="Confirm New Password"
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-9 text-[#999999] hover:text-[#666666]"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {confirmPassword.length > 0 && !doPasswordsMatch && (
                            <p className="text-xs text-red-500">Passwords do not match</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-2xl mt-2"
                            isLoading={isLoading}
                            disabled={!isPasswordValid || !doPasswordsMatch}
                        >
                            Reset Password
                        </Button>
                    </form>

                    <p className="text-center text-sm text-[#666666] dark:text-zinc-400 mt-6">
                        <Link
                            to="/login"
                            className="font-bold text-[#1A1A1A] dark:text-white hover:underline"
                        >
                            Back to Sign In
                        </Link>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};
