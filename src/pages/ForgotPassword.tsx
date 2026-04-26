import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.forgotPassword({ email });
            setIsSubmitted(true);
        } catch (err: any) {
            const message =
                err.response?.data?.description || 'Something went wrong. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
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
                        {isSubmitted ? (
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                            <KeyRound className="h-8 w-8 text-accent-dark" />
                        )}
                    </div>
                    <h1 className="text-3xl font-serif font-bold dark:text-white">
                        {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
                    </h1>
                    <p className="text-sm text-[#666666] dark:text-zinc-400 mt-2">
                        {isSubmitted
                            ? 'We\'ve sent a password reset link to your email address.'
                            : 'Enter your email and we\'ll send you a link to reset your password.'}
                    </p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow"
                >
                    {isSubmitted ? (
                        <div className="text-center space-y-6">
                            <p className="text-sm text-[#666666] dark:text-zinc-400">
                                If an account exists for <span className="font-semibold text-[#1A1A1A] dark:text-white">{email}</span>,
                                you'll receive a password reset link shortly.
                            </p>
                            <p className="text-xs text-[#999999] dark:text-zinc-500">
                                Don't see it? Check your spam folder.
                            </p>
                            <Link to="/login">
                                <Button variant="outline" className="w-full h-12 rounded-2xl mt-2">
                                    Back to Sign In
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-2xl"
                                isLoading={isLoading}
                            >
                                Send Reset Link
                            </Button>
                        </form>
                    )}

                    {!isSubmitted && (
                        <p className="text-center text-sm text-[#666666] dark:text-zinc-400 mt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1 font-bold text-[#1A1A1A] dark:text-white hover:underline"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};
