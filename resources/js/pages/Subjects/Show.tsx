import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Label } from "@/components/ui/label"
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from "@/components/ui/button"; // Import the variants

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show',
        href: '/subjects',
    },
];

export default function Show({ subject }) {
    // Helper to format the dates into a clean, readable string
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User - ${subject.name}`} />

            <div className="max-w-2xl py-8 px-4 sm:px-6 lg:px-8">

                {/* Back Button - Positioned above the card */}
                <div className="mb-6">
                    <Link
                        href={route('subjects.index')}
                        className={buttonVariants({ variant: "ghost", size: "sm" }) + " -ml-2 gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Subjects</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Subject Info
                        </h3>
                    </div>

                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">

                            {/* Primary Info */}
                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Title</Label>
                                <p className="mt-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{subject.title}</p>
                            </div>

                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Code</Label>
                                <p className="mt-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">{subject.code}</p>
                            </div>

                            {/* Metadata */}
                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Date Created</Label>
                                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                                    {formatDate(subject.created_at)}
                                </p>
                            </div>

                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Last Updated</Label>
                                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                                    {formatDate(subject.updated_at)}
                                </p>
                            </div>

                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Description</Label>
                                <p className="mt-1.5 text-sm font-mono text-zinc-400 dark:text-zinc-600">{subject.description}</p>
                            </div>

                            <div>
                                <Label className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase tracking-widest">Internal ID</Label>
                                <p className="mt-1.5 text-sm font-mono text-zinc-400 dark:text-zinc-600">#{subject.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
