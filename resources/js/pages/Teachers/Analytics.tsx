import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BarChart3,
    MessageSquare,
    Calendar,
    Star,
    FolderHeart,
    ChevronDown,
    ChevronUp,
    HelpCircle
} from 'lucide-react';

interface QuestionScore {
    id: number;
    question_text: string;
    average: number | null;
}

interface CategoryBreakdown {
    id: number;
    name: string;
    average: number | null;
    questions?: QuestionScore[];
}

interface CategoryCommentGroup {
    category_id: number;
    category_name: string;
    comments: Array<{
        text: string;
        created_at: string;
    }>;
}

interface AnalyticsProps {
    teacher: {
        id: number;
        name: string;
        employee_id: string;
    };
    metrics: {
        overall_average: number | 'N/A';
        category_breakdown: CategoryBreakdown[];
        category_comments: CategoryCommentGroup[];
    };
    settings?: {
        academic_year: string;
        semester: string;
    };
}

// Qualitative Rating Helper
const getRatingBadge = (score: number | string | null) => {
    const num = typeof score === 'string' ? parseFloat(score) : score;
    if (num === null || isNaN(num)) {
        return { label: 'N/A', class: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700' };
    }
    if (num >= 4.75) return { label: 'Outstanding', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
    if (num >= 3.50) return { label: 'Very Satisfied', class: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-200 dark:border-green-800' };
    if (num >= 2.50) return { label: 'Moderately Satisfied', class: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' };
    if (num >= 1.50) return { label: 'Slightly Satisfied', class: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border-orange-200 dark:border-orange-800' };
    return { label: 'Not Satisfied', class: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800' };
};

export default function Analytics({ teacher, metrics, settings }: AnalyticsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teachers', href: '/teachers' },
        { title: 'Evaluation Summary', href: route('teachers.analytics', teacher.id) },
    ];

    // State for controlling expanded category accordions
    const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    // Filter out categories that don't have any valid written comments
    const validCommentGroups = (metrics.category_comments || []).filter(
        (group) => group.comments && group.comments.some((c) => c.text && c.text.trim().length > 0)
    );

    const overallBadge = getRatingBadge(metrics.overall_average);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${teacher.name} - Evaluation Summary`} />

            <div className="p-4 sm:p-6 lg:p-8">
                {/* HEADER SECTION */}
                <div className="mb-6 border-b pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Link
                            href="/teachers"
                            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to directory
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {teacher.name}
                        </h1>
                        <p className="text-sm text-zinc-500 font-mono">Employee ID: {teacher.employee_id}</p>
                    </div>

                    {settings && (
                        <div className="flex items-center gap-2 px-3 py-1.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 text-xs self-start md:self-center font-medium">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>
                                A.Y. {settings.academic_year} • {settings.semester}
                            </span>
                        </div>
                    )}
                </div>

                {/* METRICS GRID */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-8">
                    {/* OVERALL SCORE CARD */}
                    <div className="w-full lg:w-1/3">
                        {/* Removed h-full below */}
                        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <h2 className="text-sm font-semibold">Overall Rating Score</h2>
                                    </div>
                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${overallBadge.class}`}>
                                        {overallBadge.label}
                                    </span>
                                </div>

                                <div className="flex items-baseline gap-1 my-3">
                                    <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                        {metrics.overall_average}
                                    </span>
                                    {metrics.overall_average !== 'N/A' && (
                                        <span className="text-zinc-400 text-sm font-mono">/ 5.00</span>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-zinc-500 leading-normal pt-4 border-t border-zinc-100 dark:border-zinc-800/60 mt-4">
                                Calculated mathematical average across all submitted numerical student evaluations for the active term block.
                            </p>
                        </div>
                    </div>

                    {/* CATEGORY & QUESTION BREAKDOWN LIST */}
                    <div className="w-full lg:w-2/3">
                        <div className="border rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-zinc-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-zinc-400" />
                                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Category & Question Breakdown</h3>
                                </div>
                                <span className="text-xs text-zinc-400 font-normal">Click category to view details</span>
                            </div>

                            <div className="p-6 space-y-4">
                                {metrics.category_breakdown
                                    .filter((cat) => cat.average !== null && cat.average !== undefined)
                                    .map((cat) => {
                                        const badge = getRatingBadge(cat.average);
                                        const isExpanded = !!expandedCategories[cat.id];
                                        const hasQuestions = cat.questions && cat.questions.length > 0;

                                        return (
                                            <div key={cat.id} className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-3.5 bg-zinc-50/30 dark:bg-zinc-900/30 transition-all">
                                                {/* Category Header Row */}
                                                <div
                                                    onClick={() => hasQuestions && toggleCategory(cat.id)}
                                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${hasQuestions ? 'cursor-pointer select-none' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200 truncate">
                                                            {cat.name}
                                                        </span>
                                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.class}`}>
                                                            {badge.label}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                                            {cat.average} <span className="text-zinc-400 font-normal">/ 5.00</span>
                                                        </span>
                                                        {hasQuestions && (
                                                            <button
                                                                type="button"
                                                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors"
                                                                aria-label="Toggle Question Breakdown"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Category Overall Progress Bar */}
                                                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2.5">
                                                    <div
                                                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${(Number(cat.average) / 5) * 100}%` }}
                                                    />
                                                </div>

                                                {/* Expandable Per-Question Breakdown */}
                                                {isExpanded && hasQuestions && (
                                                    <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800 space-y-3 bg-white dark:bg-zinc-900/60 p-3 rounded-md">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                                            Specific Questions
                                                        </p>
                                                        {cat.questions!.map((q) => {
                                                            const qBadge = getRatingBadge(q.average);
                                                            return (
                                                                <div key={q.id} className="space-y-1 text-xs">
                                                                    {/* 1. Add min-w-0 to the outer flex container so flex children can shrink properly */}
                                                                    <div className="flex justify-between items-start gap-3 min-w-0">

                                                                        {/* 2. Add break-words or break-all to force line wrapping on continuous strings */}
                                                                        <span className="text-zinc-600 dark:text-zinc-300 leading-snug break-words break-all min-w-0 flex-1">
                                                                            {q.question_text}
                                                                        </span>

                                                                        <div className="flex items-center gap-1.5 shrink-0 font-mono">
                                                                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                                                                {q.average !== null ? q.average : 'N/A'}
                                                                            </span>
                                                                            <span className={`text-[9px] px-1.5 py-0.2 rounded border ${qBadge.class}`}>
                                                                                {qBadge.label}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-indigo-400 dark:bg-indigo-500 rounded-full"
                                                                            style={{ width: `${q.average ? (q.average / 5) * 100 : 0}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                {metrics.category_breakdown.filter((cat) => cat.average !== null).length === 0 && (
                                    <p className="text-xs text-zinc-500 text-center py-4">No scores tracked for this period.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* DYNAMIC OPEN-TEXT COMMENTS GROUPED BY CATEGORY */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Written Feedback by Criteria Block
                        </h2>
                    </div>

                    {validCommentGroups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {validCommentGroups.map((group) => (
                                <div key={group.category_id} className="border rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col">
                                    {/* Group Title Area */}
                                    <div className="p-4 border-b bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FolderHeart className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                {group.category_name}
                                            </h3>
                                        </div>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                                            {group.comments.length} responses
                                        </span>
                                    </div>

                                    {/* Scrolling Comment Feed Block */}
                                    <div className="p-6 max-h-[380px] overflow-y-auto flex-1 space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/60 scrollbar-thin">
                                        {group.comments.map((comment, i) => (
                                            <div key={i} className="pt-4 first:pt-0 flex flex-col gap-1">
                                                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                                    "{comment.text}"
                                                </p>
                                                <span className="text-[10px] text-zinc-400 font-mono">
                                                    {new Date(comment.created_at).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </span>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* GLOBAL EMPTY STATE NOTE */
                        <div className="border border-dashed rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 py-12 flex flex-col items-center justify-center text-zinc-400 text-center p-4">
                            <MessageSquare className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No written evaluations found</p>
                            <p className="text-xs opacity-70 max-w-xs mt-0.5">
                                Students completed scoring profiles but omitted adding written commentary text blocks.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
