import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
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
import {
    Plus,
    Edit,
    NotebookPen,
    GraduationCap,
    AlertTriangle,
    UserCheck,
    UserMinus,
    Search,
    BarChart3,
    Trash2,
    Star,
    Download
} from 'lucide-react';

declare function route(name: string, params?: any): string;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Teachers',
        href: '/teachers',
    },
];

interface Teacher {
    id: number;
    name: string;
    employee_id: string;
    is_active: boolean;
    rating?: number | string | null;
}

interface IndexProps {
    teachers: Teacher[];
}

export default function Index({ teachers = [] }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    // Delete Modal State
    const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Forms
    const createForm = useForm({
        name: '',
        employee_id: '',
    });

    const editForm = useForm({
        name: '',
        employee_id: '',
    });

    // Color-coded rating badge helper
    const renderRatingBadge = (rating?: number | string | null) => {
        if (rating === undefined || rating === null || rating === 'N/A') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    N/A
                </span>
            );
        }

        const score = Number(rating);
        let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40';

        if (score < 3.0) {
            badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40';
        } else if (score < 4.0) {
            badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/40';
        }

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
                <Star className="w-3 h-3 fill-current" />
                <span className="font-mono">{score.toFixed(2)}</span>
            </span>
        );
    };

    // Live Search Filtering
    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher =>
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [teachers, searchTerm]);

    // Selection helpers
    const isAllSelected = filteredTeachers.length > 0 && filteredTeachers.every(t => selectedIds.includes(t.id));
    const isSomeSelected = filteredTeachers.some(t => selectedIds.includes(t.id)) && !isAllSelected;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredTeachers.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    // Handle File Export
    const handleExport = () => {
        // Direct browser trigger to your file download route
        window.location.href = route('teachers.export');
    };

    // Single Delete Execution
    const confirmDeleteSingle = () => {
        if (!deletingTeacher) return;
        router.delete(route('teachers.destroy', deletingTeacher.id), {
            onSuccess: () => {
                setSelectedIds(prev => prev.filter(id => id !== deletingTeacher.id));
                setDeletingTeacher(null);
            }
        });
    };

    // Bulk Delete Execution
    const confirmBulkDelete = () => {
        if (selectedIds.length === 0) return;
        router.delete(route('teachers.destroy-multiple'), {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setIsBulkDeleteOpen(false);
            }
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('teachers.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const handleOpenEdit = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        editForm.setData({
            name: teacher.name,
            employee_id: teacher.employee_id
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeacher) return;

        editForm.put(route('teachers.update', editingTeacher.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingTeacher(null);
                editForm.reset();
            }
        });
    };

    const handleToggleStatus = (teacher: Teacher) => {
        router.patch(route('teachers.toggle', teacher.id));
    };

    const handleCreateOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open) {
            createForm.reset();
            createForm.clearErrors();
        }
    };

    const handleEditOpenChange = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) {
            setEditingTeacher(null);
            editForm.reset();
            editForm.clearErrors();
        }
    };

    const checkboxClass = "border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 focus-visible:ring-blue-500";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Faculty Management" />

            <div className="p-4 sm:p-6 lg:p-8">

                {/* Dashboard Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Faculty Management</h1>
                        <p className="text-sm text-zinc-500">Register and view performance summary statistics for school instructors.</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* Add Teacher Dialog Button */}
                        <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 font-medium shadow-sm gap-2 w-full sm:w-auto cursor-pointer text-white">
                                    <Plus className="w-4 h-4" /> Add New Teacher
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-indigo-600" /> New Faculty Registration
                                    </DialogTitle>
                                    <DialogDescription>
                                        Enter the instructor's personal details to add them to the database.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-name">Full Name</Label>
                                        <Input
                                            type="text"
                                            id="create-name"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            placeholder="e.g. Dr. John Doe"
                                            className={createForm.errors.name ? "border-red-500" : ""}
                                        />
                                        {createForm.errors.name && <p className="text-xs text-red-500">{createForm.errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-id">Employee ID Number</Label>
                                        <Input
                                            type="text"
                                            id="create-id"
                                            value={createForm.data.employee_id}
                                            onChange={(e) => createForm.setData('employee_id', e.target.value)}
                                            placeholder="T-2026-001"
                                            className={createForm.errors.employee_id ? "border-red-500 font-mono" : "font-mono"}
                                        />
                                        {createForm.errors.employee_id && <p className="text-xs text-red-500">{createForm.errors.employee_id}</p>}
                                    </div>
                                    <DialogFooter className="pt-2">
                                        <Button type="button" variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancel</Button>
                                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={createForm.processing}>
                                            {createForm.processing ? "Registering..." : "Save Record"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                         {/* Export Button */}
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="font-medium shadow-sm gap-2 w-full sm:w-auto cursor-pointer border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <Download className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-500" />
                            Dowload Result
                        </Button>
                    </div>
                </div>

                {/* Toolbar: Search and Selection Action Bar */}
                <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input
                            type="text"
                            placeholder="Search instructor name or employee ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white dark:bg-zinc-900 shadow-sm"
                        />
                    </div>

                    {/* Selection Action Toolbar */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center justify-between sm:justify-end gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 px-3.5 py-1.5 rounded-lg text-red-700 dark:text-red-400 animate-in fade-in duration-200">
                            <span className="text-xs font-semibold">
                                {selectedIds.length} {selectedIds.length === 1 ? 'teacher' : 'teachers'} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedIds([])}
                                    className="h-7 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                >
                                    Deselect all
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setIsBulkDeleteOpen(true)}
                                    className="h-7 px-2.5 gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Table */}
                <div className="w-full border rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                            <TableRow>
                                <TableHead className="w-[40px] text-center pl-4">
                                    <Checkbox
                                        checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        aria-label="Select all rows"
                                        className={checkboxClass}
                                    />
                                </TableHead>
                                <TableHead className="font-bold w-[140px]">ID Number</TableHead>
                                <TableHead className="font-bold">Faculty Name</TableHead>
                                <TableHead className="font-bold text-center w-[130px]">Overall Rating</TableHead>
                                <TableHead className="font-bold w-[100px]">Status</TableHead>
                                <TableHead className="text-right font-bold pr-6">Management Operations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => {
                                    const isSelected = selectedIds.includes(teacher.id);
                                    return (
                                        <TableRow
                                            key={teacher.id}
                                            className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors ${isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                                                }`}
                                        >
                                            <TableCell className="text-center pl-4">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => handleSelectRow(teacher.id, !!checked)}
                                                    aria-label={`Select ${teacher.name}`}
                                                    className={checkboxClass}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-indigo-600">
                                                {teacher.employee_id}
                                            </TableCell>
                                            <TableCell>
                                                <div className={`font-medium transition-all ${!teacher.is_active ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {teacher.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {renderRatingBadge(teacher.rating)}
                                            </TableCell>
                                            <TableCell>
                                                {teacher.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                                                        Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex justify-end items-center gap-1.5">

                                                    <Link href={route('teachers.analytics', teacher.id)}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Evaluation Summary Reports"
                                                            className="h-8 w-8 rounded-md text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                                                        >
                                                            <BarChart3 className="w-4 h-4" />
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleStatus(teacher)}
                                                        className={`h-8 w-8 rounded-md transition-colors cursor-pointer ${teacher.is_active
                                                            ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                                            : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                            }`}
                                                        title={teacher.is_active ? "Deactivate Teacher" : "Activate Teacher"}
                                                    >
                                                        {teacher.is_active ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                                                    </Button>

                                                    <Link href={route('teachers.show', teacher.id)}>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            title='Assign Loads'
                                                            className='h-8 w-8 rounded-md text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 cursor-pointer'
                                                        >
                                                            <NotebookPen className="w-4 h-4" />
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        title='Edit Profile Information'
                                                        onClick={() => handleOpenEdit(teacher)}
                                                        className='h-8 w-8 rounded-md text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer'
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        title='Delete Teacher Record'
                                                        onClick={() => setDeletingTeacher(teacher)}
                                                        className='h-8 w-8 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer'
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
                                        <div className="flex flex-col items-center justify-center text-zinc-500">
                                            <GraduationCap className="w-10 h-10 mb-2 opacity-20" />
                                            <p className="font-medium">No instructors matched criteria</p>
                                            <p className="text-sm opacity-70">Try adjusting your query labels or register a record.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Modal Container */}
                <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Edit className="w-5 h-5 text-blue-600" /> Edit Faculty Profile Record
                            </DialogTitle>
                            <DialogDescription>
                                Make updates to the instructor's profile details.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    type="text"
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className={editForm.errors.name ? "border-red-500" : ""}
                                />
                                {editForm.errors.name && <p className="text-xs text-red-500">{editForm.errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-id">Employee ID Number</Label>
                                <Input
                                    type="text"
                                    id="edit-id"
                                    value={editForm.data.employee_id}
                                    onChange={(e) => editForm.setData('employee_id', e.target.value)}
                                    className={editForm.errors.employee_id ? "border-red-500 font-mono" : "font-mono"}
                                />
                                {editForm.errors.employee_id && <p className="text-xs text-red-500">{editForm.errors.employee_id}</p>}
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => handleEditOpenChange(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={editForm.processing}>
                                    {editForm.processing ? "Saving..." : "Update Details"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Single Confirmation Dialog */}
                <AlertDialog open={!!deletingTeacher} onOpenChange={(open) => !open && setDeletingTeacher(null)}>
                    <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                        <AlertDialogHeader>
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                                Delete Faculty Record
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                                Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">"{deletingTeacher?.name}"</span>?
                                This will permanently remove their profile and associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                            <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDeleteSingle}
                                className="w-full sm:w-auto order-1 sm:order-2 bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                Delete Record
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Bulk Delete Confirmation Dialog */}
                <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                    <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                        <AlertDialogHeader>
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                                Delete Selected Faculty Records
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                                You are about to purge <span className="font-extrabold text-red-600 dark:text-red-400">{selectedIds.length} selected teacher record(s)</span> from the database. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                            <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmBulkDelete}
                                className="w-full sm:w-auto order-1 sm:order-2 bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                Delete {selectedIds.length} Records
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </AppLayout>
    );
}
