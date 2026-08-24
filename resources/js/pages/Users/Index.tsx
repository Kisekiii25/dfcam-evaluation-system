import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Plus,
    Trash2,
    Edit,
    Download,
    Eye,
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    School,
    CheckCircle2,
    AlertTriangle,
    Filter,
    Calendar
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog";
import { FileSpreadsheet, Upload } from 'lucide-react';
import { useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    role: 'super-admin' | 'admin' | 'student';
    section_name?: string | null;
    evaluations_completed_count?: number;
    total_teachers_to_evaluate_count?: number;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse {
    data: User[];
    links: PaginationLinks[];
    next_page_url: string | null;
    prev_page_url: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface IndexProps {
    users: PaginatedResponse;
    filters: {
        search?: string;
        evaluation_status?: string;
        academic_year?: string;
        semester?: string;
    };
    academicYears?: string[];
}

export default function Index({ users, filters, academicYears }: IndexProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [userToDestroy, setUserToDestroy] = useState<{ id: number; name: string } | null>(null);

    // Initialize state directly from incoming props without hardcoded fallbacks
    const [search, setSearch] = useState(filters?.search || '');
    const [evaluationStatus, setEvaluationStatus] = useState(filters?.evaluation_status || '');
    const [academicYear, setAcademicYear] = useState(filters?.academic_year || '');
    const [semester, setSemester] = useState(filters?.semester || '');

    const isFirstRender = useRef(true);
    const currentUsers = users?.data || [];
    const yearOptions = academicYears || ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];

    // Keep state in sync whenever Inertia passes updated props from the backend
    useEffect(() => {
        if (filters?.semester !== undefined) setSemester(filters.semester);
        if (filters?.academic_year !== undefined) setAcademicYear(filters.academic_year);
        if (filters?.search !== undefined) setSearch(filters.search || '');
        if (filters?.evaluation_status !== undefined) setEvaluationStatus(filters.evaluation_status || '');
    }, [filters]);

    const executeQuery = () => {
        router.get(
            route('users.index'),
            {
                search,
                evaluation_status: evaluationStatus,
                academic_year: academicYear,
                semester,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeQuery();
    };

    // Trigger router search/filtering on dropdown or text input changes
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            executeQuery();
        }, 400);

        return () => clearTimeout(timer);
    }, [search, academicYear, semester, evaluationStatus]);

    const openDeleteConfirmation = (id: number, name: string) => {
        setUserToDestroy({ id, name });
        setDeleteModalOpen(true);
    };

    const confirmSingleDelete = () => {
        if (userToDestroy) {
            router.delete(route('users.destroy', userToDestroy.id), {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setUserToDestroy(null);
                }
            });
        }
    };

    const confirmBulkDelete = () => {
        router.post(route('users.bulk-destroy'), {
            ids: selectedIds
        }, {
            onSuccess: () => {
                setBulkDeleteModalOpen(false);
                setSelectedIds([]);
            },
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === currentUsers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentUsers.map(user => user.id));
        }
    };

    const toggleSelectUser = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Pagination calculations
    const perPage = users?.per_page || currentUsers.length || 10;
    const fromCount = users?.total === 0 ? 0 : ((users?.current_page || 1) - 1) * perPage + 1;
    const toCount = Math.min((users?.current_page || 1) * perPage, users?.total || 0);

    // import and export
    const [importModalOpen, setImportModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, progress } = useForm<{ file: File | null }>({
        file: null,
    });

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return;

        post(route('users.import'), {
            onSuccess: () => {
                setImportModalOpen(false);
                reset();
            },
        });
    };

    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportYear, setExportYear] = useState(academicYear || yearOptions[0]);
    const [exportSemester, setExportSemester] = useState(semester || '1st');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col gap-6">

                    {/* --- HEADER TIER 1: Title & Actions --- */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-zinc-800">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">User Management</h1>
                            <p className="text-xs sm:text-sm text-zinc-500">Manage team members, roles, and student evaluation progress.</p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            {selectedIds.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setBulkDeleteModalOpen(true)}
                                    className="h-9 animate-in fade-in zoom-in duration-200"
                                >
                                    <Trash2 className="w-4 h-4 mr-1.5" />
                                    Delete ({selectedIds.length})
                                </Button>
                            )}

                            <Link href={route('admin.students.sections')} className="flex-1 sm:flex-initial">
                                <Button variant="outline" size="sm" className="cursor-pointer w-full h-9 shadow-sm text-zinc-700 dark:text-zinc-300">
                                    <School className="w-4 h-4 mr-1.5 text-indigo-500" />
                                    <span>Assign Sections</span>
                                </Button>
                            </Link>

                            <Link href={route('users.create')} className="flex-1 sm:flex-initial">
                                <Button size="sm" className="cursor-pointer w-full h-9 shadow-sm">
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    <span>Add User</span>
                                </Button>
                            </Link>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setImportModalOpen(true)}
                                className="cursor-pointer h-9 shadow-sm text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-500" />
                                <span>Import Excel</span>
                            </Button>

                            {/* Updated Export Button (Triggers Modal) */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExportModalOpen(true)}
                                className="cursor-pointer h-9 shadow-sm text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-500" />
                                <span>Export Students</span>
                            </Button>
                        </div>
                    </div>

                    {/* --- HEADER TIER 2: Responsive Filter Bar --- */}
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                        {/* Search Input */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                type="search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search name or email..."
                                className="pl-9 w-full bg-white dark:bg-zinc-950 shadow-sm"
                            />
                        </div>

                        {/* Academic Year Dropdown */}
                        <div className="relative w-full">
                            <select
                                value={academicYear}
                                onChange={e => setAcademicYear(e.target.value)}
                                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 appearance-none pr-8 text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        A.Y. {year}
                                    </option>
                                ))}
                            </select>
                            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>

                        {/* Semester Dropdown */}
                        <div className="relative w-full">
                            <select
                                value={semester}
                                onChange={e => setSemester(e.target.value)}
                                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 appearance-none pr-8 text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium"
                            >
                                <option value="1st">1st Semester</option>
                                <option value="2nd">2nd Semester</option>
                                <option value="Summer">Summer</option>
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>

                        {/* Evaluation Status Filter */}
                        <div className="relative w-full">
                            <select
                                value={evaluationStatus}
                                onChange={e => setEvaluationStatus(e.target.value)}
                                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 appearance-none pr-8 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                    </form>

                    {/* Table Container */}
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto relative">
                            <Table className="w-full min-w-[800px]">
                                <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                                    <TableRow>
                                        <TableHead className="w-[50px] px-4">
                                            <Checkbox
                                                className="border-blue-500 cursor-pointer"
                                                checked={currentUsers.length > 0 && selectedIds.length === currentUsers.length}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-zinc-700 dark:text-zinc-200">User Details</TableHead>
                                        <TableHead className="font-bold text-zinc-700 dark:text-zinc-200">Role</TableHead>
                                        <TableHead className="font-bold text-zinc-700 dark:text-zinc-200">Assigned Section</TableHead>
                                        <TableHead className="font-bold text-zinc-700 dark:text-zinc-200">Evaluation Status</TableHead>
                                        <TableHead className="text-right font-bold pr-6 text-zinc-700 dark:text-zinc-200">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentUsers.length > 0 ? (
                                        currentUsers.map((user) => {
                                            const total = user.total_teachers_to_evaluate_count || 0;
                                            const completed = user.evaluations_completed_count || 0;
                                            const isDone = total > 0 && completed >= total;

                                            return (
                                                <TableRow key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <TableCell className="px-4">
                                                        <Checkbox
                                                            className="border-blue-500 cursor-pointer"
                                                            checked={selectedIds.includes(user.id)}
                                                            onCheckedChange={() => toggleSelectUser(user.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-3.5">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{user.name}</span>
                                                            <span className="text-xs text-zinc-500 whitespace-nowrap">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        {user.role === 'super-admin' && (
                                                            <Badge className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/10 border-red-200/40 capitalize text-xs whitespace-nowrap px-2.5 py-0.5 font-semibold">
                                                                Super Admin
                                                            </Badge>
                                                        )}
                                                        {user.role === 'admin' && (
                                                            <Badge className="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-500/10 border-blue-200/40 capitalize text-xs whitespace-nowrap px-2.5 py-0.5 font-semibold">
                                                                Admin
                                                            </Badge>
                                                        )}
                                                        {user.role === 'student' && (
                                                            <Badge className="bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400 hover:bg-zinc-500/10 border-zinc-200/40 capitalize text-xs whitespace-nowrap px-2.5 py-0.5 font-semibold">
                                                                Student
                                                            </Badge>
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {user.role === 'student' && user.section_name ? (
                                                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap tracking-wide">
                                                                {user.section_name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500 italic whitespace-nowrap">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {user.role === 'student' ? (
                                                            <div className="flex flex-col gap-1 min-w-[140px]">
                                                                <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
                                                                    <span className={isDone ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-500"}>
                                                                        {completed} / {total} Done
                                                                    </span>
                                                                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                                                </div>

                                                                <div className="w-24 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                        style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500 italic whitespace-nowrap">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={route('users.show', user.id)}>
                                                                <Button variant='ghost' size='icon' className='h-8 w-8 cursor-pointer text-zinc-400 hover:text-zinc-100'>
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={route('users.edit', user.id)}>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-950/30 cursor-pointer'
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                onClick={() => openDeleteConfirmation(user.id, user.name)}
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/30 cursor-pointer'
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center text-zinc-500 p-6">
                                                    <Users className="w-10 h-10 mb-2 opacity-20" />
                                                    <p className="font-medium">No users found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {(users?.total || 0) > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm mt-1 text-center sm:text-left">
                                    <div className="text-xs sm:text-sm text-zinc-500">
                                        Showing <span className="font-semibold text-zinc-700 dark:text-zinc-300">{fromCount}</span> to <span className="font-semibold text-zinc-700 dark:text-zinc-300">{toCount}</span> of <span className="font-semibold text-zinc-700 dark:text-zinc-300">{users.total}</span> users
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                        <Link
                                            href={users.prev_page_url || '#'}
                                            only={['users']}
                                            preserveState={true}
                                            className={`flex-1 sm:flex-initial ${!users.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
                                        >
                                            <Button variant="outline" size="sm" className="w-full" disabled={!users.prev_page_url}>
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Previous
                                            </Button>
                                        </Link>

                                        <Link
                                            href={users.next_page_url || '#'}
                                            only={['users']}
                                            preserveState={true}
                                            className={`flex-1 sm:flex-initial ${!users.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
                                        >
                                            <Button variant="outline" size="sm" className="w-full" disabled={!users.next_page_url}>
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>

            {/* Import Modal */}
            <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogOverlay className="bg-black/30" />
                <DialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <form onSubmit={handleImportSubmit}>
                        <DialogHeader>
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mb-2">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-center text-base sm:text-lg font-bold">Import Users via Excel</DialogTitle>
                            <DialogDescription className="text-center text-xs sm:text-sm pt-1">
                                Upload an .xlsx or .csv file containing student or staff records.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-4 space-y-3">
                            <div className="grid w-full items-center gap-1.5">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    className="cursor-pointer text-xs sm:text-sm"
                                />
                                {errors.file && (
                                    <p className="text-xs text-red-500 font-medium mt-1">{errors.file}</p>
                                )}
                            </div>

                            {progress && (
                                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                            <Button variant="outline" type="button" onClick={() => setImportModalOpen(false)} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || !data.file} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Upload className="w-4 h-4 mr-1.5" />
                                {processing ? 'Uploading...' : 'Upload File'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
                <DialogOverlay className="bg-black/70" />

                <DialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <DialogHeader>
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mb-2">
                            <Download className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-center text-base sm:text-lg font-bold">Export Student Records</DialogTitle>
                        <DialogDescription className="text-center text-xs sm:text-sm pt-1">
                            Select the academic year and semester to generate the file.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4 space-y-4">
                        {/* Academic Year Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Academic Year</label>
                            <div className="relative w-full">
                                <select
                                    value={exportYear}
                                    onChange={(e) => setExportYear(e.target.value)}
                                    className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 appearance-none pr-8 text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium"
                                >
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>
                                            A.Y. {year}
                                        </option>
                                    ))}
                                </select>
                                <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Semester Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Semester</label>
                            <div className="relative w-full">
                                <select
                                    value={exportSemester}
                                    onChange={(e) => setExportSemester(e.target.value)}
                                    className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 appearance-none pr-8 text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium"
                                >
                                    <option value="1st">1st Semester</option>
                                    <option value="2nd">2nd Semester</option>
                                    <option value="Summer">Summer</option>
                                </select>
                                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button variant="outline" type="button" onClick={() => setExportModalOpen(false)} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <a
                            href={route('users.export', { academic_year: exportYear, semester: exportSemester })}
                            onClick={() => setExportModalOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Download className="w-4 h-4 mr-1.5" />
                                Download File
                            </Button>
                        </a>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <form onSubmit={handleImportSubmit}>
                        <DialogHeader>
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mb-2">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-center text-base sm:text-lg font-bold">Import Users via Excel</DialogTitle>
                            <DialogDescription className="text-center text-xs sm:text-sm pt-1">
                                Upload an .xlsx or .csv file containing student or staff records.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-4 space-y-3">
                            <div className="grid w-full items-center gap-1.5">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    className="cursor-pointer text-xs sm:text-sm"
                                />
                                {errors.file && (
                                    <p className="text-xs text-red-500 font-medium mt-1">{errors.file}</p>
                                )}
                            </div>

                            {progress && (
                                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                            <Button variant="outline" type="button" onClick={() => setImportModalOpen(false)} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || !data.file} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Upload className="w-4 h-4 mr-1.5" />
                                {processing ? 'Uploading...' : 'Upload File'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Modals */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                            Delete Account Profile
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                            Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">"{userToDestroy?.name}"</span>?
                            This action is permanent and cannot be reversed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSingleDelete}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Modals */}
            <AlertDialog open={bulkDeleteModalOpen} onOpenChange={setBulkDeleteModalOpen}>
                <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                            Bulk Delete Selected Users
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                            You are about to purge <span className="font-extrabold text-red-600 dark:text-red-400">{selectedIds.length} selected user profiles</span> from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Selected Items
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <form onSubmit={handleImportSubmit}>
                        <DialogHeader>
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mb-2">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-center text-base sm:text-lg font-bold">Import Users via Excel</DialogTitle>
                            <DialogDescription className="text-center text-xs sm:text-sm pt-1">
                                Upload an .xlsx or .csv file containing student or staff records.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-4 space-y-3">
                            <div className="grid w-full items-center gap-1.5">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    className="cursor-pointer text-xs sm:text-sm"
                                />
                                {errors.file && (
                                    <p className="text-xs text-red-500 font-medium mt-1">{errors.file}</p>
                                )}
                            </div>

                            {progress && (
                                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                            <Button variant="outline" type="button" onClick={() => setImportModalOpen(false)} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || !data.file} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Upload className="w-4 h-4 mr-1.5" />
                                {processing ? 'Uploading...' : 'Upload File'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
