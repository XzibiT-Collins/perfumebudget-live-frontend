import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export const VerifyOtp = () => {
    const { verifyOtp, verifyLoginOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = (location.state as any)?.email || '';
    const challengeToken = (location.state as any)?.challengeToken || '';
    const isLoginOtp = (location.state as any)?.isLoginOtp || false;

    const [email, setEmail] = useState(emailFromState);
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // only digits
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = [...otp];
        for (let i = 0; i < pasted.length; i++) {
            next[i] = pasted[i];
        }
        setOtp(next);
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    const otpValue = otp.join('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoginOtp && !email) {
            toast.error('Please enter your email address');
            return;
        }
        if (otpValue.length !== OTP_LENGTH) {
            toast.error(`Please enter all ${OTP_LENGTH} digits`);
            return;
        }
        setIsLoading(true);
        try {
            if (isLoginOtp) {
                await verifyLoginOtp(challengeToken, otpValue);
                toast.success('Login successful!');
            } else {
                await verifyOtp(email, otpValue);
                toast.success('Email verified! Welcome aboard!');
            }
            navigate('/', { replace: true });
        } catch (err: any) {
            const message =
                err.response?.data?.description || 'Invalid or expired OTP. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!isLoginOtp && !email) {
            toast.error('Please enter your email address');
            return;
        }
        setIsResending(true);
        try {
            if (isLoginOtp) {
                await authService.resendLoginOtp({ challengeToken });
            } else {
                await authService.resendOtp({ email });
            }
            toast.success('A new code has been sent to your email');
            setCooldown(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            const message =
                err.response?.data?.description || 'Failed to resend code. Please try again.';
            toast.error(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-zinc-950 px-4"
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="mx-auto w-16 h-16 bg-accent/20 dark:bg-accent/10 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-8 w-8 text-accent-dark" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold dark:text-white">Verify Your Email</h1>
                    <p className="text-sm text-[#666666] dark:text-zinc-400 mt-2">
                        {emailFromState
                            ? <>We've sent a verification code to <span className="font-semibold text-[#1A1A1A] dark:text-white">{emailFromState}</span></>
                            : 'Enter your email and the verification code sent to you'}
                    </p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email field — editable if not passed via state */}
                        {!emailFromState && (
                            <div>
                                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-zinc-300 mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5] dark:border-zinc-700 bg-transparent text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                />
                            </div>
                        )}

                        {/* OTP input boxes */}
                        <div>
                            <label className="block text-sm font-medium text-[#1A1A1A] dark:text-zinc-300 mb-3 text-center">
                                Enter verification code
                            </label>
                            <div className="flex justify-center gap-3" onPaste={handlePaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-[#E5E5E5] dark:border-zinc-700 bg-transparent text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-2xl"
                            isLoading={isLoading}
                            disabled={otpValue.length !== OTP_LENGTH}
                        >
                            Verify Email
                        </Button>
                    </form>

                    {/* Resend OTP */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-[#666666] dark:text-zinc-400 mb-2">
                            Didn't receive a code?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={cooldown > 0 || isResending}
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#1A1A1A] dark:text-white hover:text-accent-dark dark:hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                        </button>
                    </div>

                    <p className="text-center text-sm text-[#666666] dark:text-zinc-400 mt-6">
                        Wrong email?{' '}
                        <Link
                            to="/register"
                            className="font-bold text-[#1A1A1A] dark:text-white hover:underline"
                        >
                            Go back
                        </Link>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};
