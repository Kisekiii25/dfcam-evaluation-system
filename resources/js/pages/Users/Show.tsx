import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { buttonVariants } from "@/components/ui/button";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Show Profile',
        href: '#',
    },
];

interface UserProfileProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: 'super-admin' | 'admin' | 'student';
        created_at: string;
        updated_at: string;
        section_name: string | null;
        evaluations_completed_count: number;
        total_teachers_to_evaluate_count: number;
    };
}

export default function Show({ user }: UserProfileProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const total = user.total_teachers_to_evaluate_count || 0;
    const completed = user.evaluations_completed_count || 0;
    const isDone = total > 0 && completed >= total;
    const progressPercent = total > 0 ? (completed / total) * 100 : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User - ${user.name}`} />

            <div className="max-w-2xl py-8 px-4 sm:px-6 lg:px-8 mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={route('users.index')}
                        className={buttonVariants({ variant: "ghost", size: "sm" }) + " -ml-2 gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Users</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            User Profile Information
                        </h3>
                        {/* Dynamic Custom Color Role Badges */}
                        <div>
                            {user.role === 'super-admin' && (
                                <span className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200/20 capitalize text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                                    Super Admin
                                </span>
                            )}
                            {user.role === 'admin' && (
                                <span className="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200/20 capitalize text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                                    Admin
                                </span>
                            )}
                            {user.role === 'student' && (
                                <span className="bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400 border border-zinc-200/20 capitalize text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                                    Student
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Primary Account Info */}
                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Full Name</Label>
                                <p className="mt-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                            </div>

                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Email Address</Label>
                                <p className="mt-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.email}</p>
                            </div>

                            {/* Section Assignment for Students */}
                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Assigned Section</Label>
                                {user.role === 'student' ? (
                                    <p className="mt-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                        {user.section_name || <span className="text-zinc-400 italic font-normal">Unassigned</span>}
                                    </p>
                                ) : (
                                    <p className="mt-1.5 text-sm text-zinc-400 dark:text-zinc-500 italic">Not Applicable</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Internal Account ID</Label>
                                <p className="mt-1.5 text-sm font-mono text-zinc-500 dark:text-zinc-500">#{user.id}</p>
                            </div>

                            {/* History Metadata */}
                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Date Created</Label>
                                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                                    {formatDate(user.created_at)}
                                </p>
                            </div>

                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Last Updated</Label>
                                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                                    {formatDate(user.updated_at)}
                                </p>
                            </div>
                        </div>

                        {/* Student Evaluation Real-Time Progress Metric block */}
                        {user.role === 'student' && (
                            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest block mb-3">
                                    Faculty Evaluation Progress
                                </Label>
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${isDone ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                                {completed} of {total} Evaluations Submitted
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {isDone ? 'Completed evaluating all assigned professors.' : 'Pending feedback inputs.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-1/3 flex flex-col gap-1.5">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className={isDone ? 'text-emerald-500' : 'text-amber-500'}>
                                                {Math.round(progressPercent)}% Done
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
