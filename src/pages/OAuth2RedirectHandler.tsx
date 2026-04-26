import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const USER_STORAGE_KEY = 'pb_user';

export const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        const handleRedirect = async () => {
            const params = new URLSearchParams(location.search);
            const success = params.get('success');

            if (success === 'true') {
                try {
                    // Fetch fresh user data after successful social login
                    const me = await authService.getMe();

                    // We need a way to update the parent context's state.
                    // Since AuthContext already has some logic to check session on mount,
                    // but we want to trigger it NOW and show toast.
                    // The best way here is to reload or rely on a state update.
                    // Since we are using AuthContext, we can't easily reach 'setUser' directly
                    // unless we expose it or use a method that does it.

                    // Let's assume AuthProvider's checkSession will run if we redirect to home,
                    // or we can just window.location.href = '/' to force a fresh state.
                    // However, better UX is to use navigate.

                    // Redirect to home or intended destination
                    toast.success('Welcome back!');
                    window.location.href = '/'; // Hard reload to refresh AuthContext state
                } catch (error) {
                    console.error('Failed to fetch user after Google login:', error);
                    toast.error('Authentication failed');
                    navigate('/login');
                }
            } else {
                toast.error('Login failed');
                navigate('/login');
            }
        };

        handleRedirect();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-zinc-950">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-4 text-sm text-[#666666] dark:text-zinc-400">Completing sign in...</p>
            </div>
        </div>
    );
};
