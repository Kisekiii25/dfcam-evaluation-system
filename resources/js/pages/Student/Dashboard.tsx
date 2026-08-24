import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    LogOut, Info, CheckCircle, X,
    Touchpad, CheckSquare, Filter, UserCheck, Menu, Calendar
} from 'lucide-react';

interface DashboardProps {
    settings: {
        academic_year: string;
        semester: string;
    };
    auth: {
        user: {
            name: string;
            role: string;
        };
    };
}

export default function Dashboard({ settings, auth }: DashboardProps) {
    const [isReminderOpen, setIsReminderOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen w-full bg-[#0a1128] text-white font-sans flex flex-col justify-between relative overflow-x-hidden">
            <Head title="Evaluation Portal" />

            {/* Navbar Header */}
            <nav className="bg-[#111a36] border-b border-slate-800 shadow-md relative z-30 w-full">
                <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 max-w-7xl mx-auto">
                    {/* Branding */}
                    <div className="flex items-center space-x-3 shrink-0">
                        <img
                            src="/DFCAM-logo.webp"
                            alt="DFCAMCLP Logo"
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-900/30 object-cover"
                        />
                        <div>
                            <h1 className="font-bold text-xs sm:text-sm tracking-wide text-white leading-tight">
                                DFCAMCLP
                            </h1>
                            <p className="text-[9px] sm:text-[10px] text-blue-400 font-semibold tracking-wider">
                                EVALUATION PORTAL
                            </p>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-5 text-sm">
                        <span className="bg-[#1d2d50] text-blue-400 text-xs px-3 py-1 rounded-full font-semibold">
                            A.Y. {settings?.academic_year || '2027-2028'}
                        </span>

                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium text-xs uppercase tracking-wider"
                        >
                            <Info size={15} />
                            <span>How to use?</span>
                        </button>

                        <div className="flex items-center space-x-4 pl-2 border-l border-slate-800">
                            <span className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs text-slate-200 font-semibold tracking-wide max-w-[160px] truncate">
                                {auth?.user?.name}
                            </span>

                            <button
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold"
                                title="Sign Out"
                            >
                                <LogOut size={15} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors focus:outline-none"
                        aria-label="Open Menu"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </nav>

            {/* Mobile Slide Drawer */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ${
                    isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Backdrop Overlay (No Blur to Prevent Background Color Shift) */}
                <div
                    className="absolute inset-0 bg-[#050915]/80 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Sliding Side Panel */}
                <aside
                    className={`absolute top-0 right-0 h-full w-[280px] bg-[#111a36] border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
                        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div>
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                            <div className="flex items-center space-x-2.5">
                                <img
                                    src="/DFCAM-logo.webp"
                                    alt="DFCAMCLP Logo"
                                    className="w-7 h-7 rounded-full border border-blue-900/30 object-cover"
                                />
                                <span className="font-bold text-xs tracking-wider uppercase text-blue-400">
                                    Menu
                                </span>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                                aria-label="Close Menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* User Details */}
                        <div className="bg-[#1d2d50]/40 border border-slate-800 p-3.5 rounded-xl mb-6">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                                Signed in as
                            </p>
                            <p className="text-xs font-bold text-slate-100 truncate">
                                {auth?.user?.name}
                            </p>
                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-blue-400 font-medium">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    A.Y.
                                </span>
                                <span className="font-semibold">
                                    {settings?.academic_year || '2027-2028'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setIsGuideOpen(true);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 transition-colors text-xs font-semibold uppercase tracking-wider text-left"
                            >
                                <Info size={18} className="text-blue-400" />
                                <span>How to use?</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Logout Button */}
                    <div className="pt-4 border-t border-slate-800">
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleLogout();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Hero Main Body */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 text-center max-w-5xl mx-auto w-full py-8 sm:py-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">

                    {/* Big Seal Left */}
                    <div className="shrink-0">
                        <img
                            src="/DFCAM-logo.webp"
                            alt="DFCAMCLP Logo"
                            className="w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 object-contain shadow-2xl rounded-full border-4 border-blue-900/30 bg-white/5"
                        />
                    </div>

                    {/* Text Details Right */}
                    <div className="text-center md:text-left max-w-2xl">
                        <h4 className="text-blue-400 font-semibold uppercase text-[11px] sm:text-xs md:text-sm tracking-widest mb-2">
                            Guidance and Counseling Services Office
                        </h4>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight mb-3 sm:mb-4 text-slate-100">
                            DR. FILEMON C. AGUILAR MEMORIAL COLLEGE OF LAS PIÑAS
                        </h2>
                        <p className="text-slate-400 font-medium text-[11px] sm:text-xs md:text-sm tracking-wide uppercase mb-1">
                            IT Campus | Student – Faculty Performance Evaluation
                        </p>
                        <p className="text-slate-500 font-bold text-[11px] sm:text-xs md:text-sm tracking-wide uppercase mb-6 sm:mb-8">
                            A.Y. {settings?.academic_year} ({settings?.semester || '1st Semester'}, MIDTERM)
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <button
                                onClick={() => setIsReminderOpen(true)}
                                className="inline-block px-8 py-3 border border-slate-500 hover:border-blue-500 rounded text-xs sm:text-sm font-semibold tracking-wider hover:bg-blue-600/10 hover:text-blue-400 transition duration-300 uppercase shadow-md bg-[#0d1636]"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* POPUP 1: Quick Start Guide Modal */}
            {isGuideOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-[#050915]/80 transition-opacity"
                        onClick={() => setIsGuideOpen(false)}
                    />

                    <div className="relative w-full max-w-md bg-[#111a36] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-white z-10 flex flex-col items-center max-h-[90vh] overflow-y-auto">

                        <h3 className="text-lg sm:text-xl font-black text-center mb-6 sm:mb-8 tracking-wide">
                            Quick Start Guide
                        </h3>

                        <div className="w-full space-y-5 sm:space-y-6 text-left mb-6 sm:mb-8 px-1 sm:px-2">

                            {/* Step 1 */}
                            <div className="flex items-start gap-3.5 sm:gap-4">
                                <div className="text-blue-400 mt-1 shrink-0">
                                    <Touchpad size={20} className="stroke-[2.5]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-100 tracking-wide">1. Get Started</h4>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Click "Get Started" on the landing page.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-3.5 sm:gap-4">
                                <div className="text-blue-400 mt-1 shrink-0">
                                    <CheckSquare size={20} className="stroke-[2.5]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-100 tracking-wide">2. Read Reminders</h4>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Read the guidelines and click "I Understand".</p>
                                </div>
                            </div>

                            {/* Step 3
                            <div className="flex items-start gap-3.5 sm:gap-4">
                                <div className="text-blue-400 mt-1 shrink-0">
                                    <Filter size={20} className="stroke-[2.5]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-100 tracking-wide">3. Set Filters</h4>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Choose Course/Year/Section. Use "Clear all filters" to reset.</p>
                                </div>
                            </div> */}

                            {/* Step 3 */}
                            <div className="flex items-start gap-3.5 sm:gap-4">
                                <div className="text-blue-400 mt-1 shrink-0">
                                    <UserCheck size={20} className="stroke-[2.5]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-100 tracking-wide">3. Pick a Teacher</h4>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Select the faculty member you want to evaluate.</p>
                                </div>
                            </div>

                        </div>

                        <button
                            onClick={() => setIsGuideOpen(false)}
                            className="w-32 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-md active:scale-95"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}

            {/* POPUP 2: Evaluation Rules Reminder Modal */}
            {isReminderOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-[#050915]/80 transition-opacity"
                        onClick={() => setIsReminderOpen(false)}
                    />

                    <div className="relative w-full max-w-md bg-[#111a36] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-white z-10 max-h-[90vh] overflow-y-auto">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                            <h3 className="text-base sm:text-lg font-black flex items-center gap-2 uppercase tracking-wide text-blue-400">
                                <Info size={18} />
                                Evaluation Rules
                            </h3>
                            <button
                                onClick={() => setIsReminderOpen(false)}
                                className="text-slate-400 hover:text-white rounded-lg p-1 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body Details */}
                        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-slate-300 mb-6 font-medium">
                            <p>
                                This Online Evaluation aims to obtain feedback from you to assess our faculty members based on the given indicators.
                            </p>
                            <p>
                                Please rate the quality of the performance of the faculty concerned.
                            </p>
                            <p>
                                All instructors must be evaluated. Kindly give an accurate and honest response to each of the items.
                            </p>
                            <p className="text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-center tracking-wide uppercase text-[11px]">
                                Warning: Don't use foul words.
                            </p>

                            <div className="flex items-start bg-blue-500/10 border-l-4 border-blue-500 p-3 rounded-r-lg mt-2">
                                <p className="text-blue-400 text-[11px] font-bold uppercase tracking-wider">
                                    Note: 5 is the highest grade and 1 is the lowest.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                            <button
                                onClick={() => setIsReminderOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition"
                            >
                                Cancel
                            </button>
                            <Link
                                href={route('evaluation.select')}
                                onClick={() => setIsReminderOpen(false)}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md transition-all active:scale-95"
                            >
                                <CheckCircle size={14} />
                                I Understand
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
