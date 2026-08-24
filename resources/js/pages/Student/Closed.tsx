import { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LogOut, LockKeyhole, RotateCw, AlertCircle, X } from 'lucide-react';

export default function Closed() {
    const { auth } = usePage().props as any;

    const fullName = auth?.user?.name || 'Student';
    const firstName = fullName.split(' ')[0];

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => {
                if (isMounted.current) setShowPopup(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setShowPopup(false);

        router.visit('/dashboard', {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                if (isMounted.current) {
                    setIsRefreshing(false);
                    setShowPopup(true);
                }
            }
        });
    };

    return (
        <div className="relative min-h-screen bg-[#0a122c] flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none overflow-hidden">
            <Head title="System Closed" />

            {/*
                MOBILE-OPTIMIZED POPUP:
                - Mobile: Floats at the top center with left/right margins (left-4 right-4).
                - Desktop (sm:): Snaps cleanly to the top right corner.
            */}
            <div
                className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 w-auto sm:w-full sm:max-w-sm bg-[#111a36] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl transition-all duration-300 flex items-start gap-2.5 sm:gap-3 text-left ${
                    showPopup
                        ? 'translate-y-0 opacity-100 scale-100'
                        : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
                }`}
            >
                <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 shrink-0">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0 mt-0.5">
                    <h4 className="text-sm font-bold text-white">Evaluation Still Closed</h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                        We checked the status, but the administration has not opened the evaluation period yet. Please try again later!
                    </p>
                </div>
                <button
                    onClick={() => setShowPopup(false)}
                    className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Premium background glow elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-blue-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center transition-all duration-300">

                {/* 1. Personalized Warm Welcome Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm text-blue-300 font-semibold mb-6 shadow-inner">
                    <span>Hi, {firstName}!</span>
                    <span className="animate-bounce">👋</span>
                </div>

                {/* 2. Premium Yellow Lock Icon */}
                <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 group cursor-pointer bg-yellow-500/10 border-2 border-yellow-500/30 rounded-full shadow-lg shadow-yellow-500/5 transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/15">
                    <LockKeyhole className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 stroke-[2] transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* 3. Main Title */}
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wider text-white mb-3 uppercase font-sans">
                    System Closed
                </h1>

                {/* 4. Description Message */}
                <div className="space-y-2 px-2">
                    <p className="text-xs sm:text-base text-blue-200/80 leading-relaxed font-medium">
                        DFCAMCLP Faculty Evaluation system is currently closed.
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                        Thank you for checking in, <span className="text-blue-300 font-bold">{fullName}</span>! Please look out for official announcements from the Admin for the next evaluation run.
                    </p>
                </div>

                {/* 5. Blue Accent Divider */}
                <div className="w-12 h-1 bg-blue-600 rounded-full mt-6 mb-8 shadow-md shadow-blue-500/50" />

                {/* 6. Action Button Container */}
                <div className="w-full max-w-xs flex flex-col gap-3 px-2 sm:px-0">
                    {/* Primary Action: Check Status */}
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="w-full gap-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-800/80 text-white font-bold py-6 text-sm rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 border-none transition-all duration-200 active:scale-95"
                    >
                        <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Checking...' : 'Check Status Again'}
                    </Button>

                    {/* Secondary Action: Log Out */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        type="button"
                        className="w-full gap-2.5 inline-flex items-center justify-center bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-semibold py-4 text-sm rounded-xl transition-all duration-200 border border-slate-800/80 active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out Account
                    </Link>
                </div>

            </div>
        </div>
    );
}
