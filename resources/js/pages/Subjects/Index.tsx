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
import { useState } from 'react';
import { AlertTriangle, BookOpen, Eye, Edit, Trash2, Plus } from 'lucide-react';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subjects',
        href: '/subjects',
    },
];

interface Subject {
    id: number;
    title: string;
    code: string;
    description: string;
}

interface IndexProps {
    subjects: Subject[];
}

export default function Index({ subjects }: IndexProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deletingSubject, setDeletingSubject] = useState<{ id: number; title: string } | null>(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    // State controlling edit modal visibility
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    // Create Form
    const createForm = useForm({
        title: '',
        code: '',
        description: '',
    });

    // Edit Form
    const editForm = useForm({
        title: '',
        code: '',
        description: '',
    });

    // Directly open edit modal and pre-fill form
    const handleOpenEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        editForm.clearErrors();
        editForm.setData({
            title: subject.title,
            code: subject.code,
            description: subject.description || '',
        });
    };

    // Update Form Submission
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubject) return;

        editForm.put(route('subjects.update', editingSubject.id), {
            onSuccess: () => {
                setEditingSubject(null);
                editForm.reset();
            },
        });
    };

    // Delete single item
    const confirmSingleDelete = (id: number) => {
        router.delete(route('subjects.destroy', id), {
            onSuccess: () => {
                setSelectedIds((prev) => prev.filter((item) => item !== id));
            },
        });
    };

    // Bulk Delete
    const confirmBulkDelete = () => {
        if (selectedIds.length === 0) return;

        router.post(route('subjects.bulk-destroy'), {
            _method: 'DELETE',
            ids: selectedIds,
        }, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsBulkDeleteOpen(false);
            },
        });
    };

    // Select row helpers
    const toggleSelectAll = () => {
        if (selectedIds.length === subjects.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(subjects.map((s) => s.id));
        }
    };

    const toggleSelectRow = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Create Submit
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('subjects.store'), {
            onSuccess: () => createForm.reset(),
        });
    };

    const isAllSelected = subjects.length > 0 && selectedIds.length === subjects.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />

            <div className="p-4 sm:p-6 lg:p-8">

                {/* Header */}
                <div className='mb-6 border-b pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Subject Management</h1>
                        <p className="text-sm text-zinc-500">Manage your subjects.</p>
                    </div>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-2 rounded-lg">
                            <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setIsBulkDeleteOpen(true)}
                                className="h-8 gap-1 text-xs"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Selected
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Panel: Create Subject */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Plus className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold">New Subject</h2>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor='title'>Title</Label>
                                    <Input
                                        type='text'
                                        id='title'
                                        value={createForm.data.title}
                                        onChange={(e) => createForm.setData('title', e.target.value)}
                                        placeholder='Web Development'
                                        className={createForm.errors.title ? "border-red-500" : ""}
                                    />
                                    {createForm.errors.title && <p className="text-xs text-red-500">{createForm.errors.title}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor='code'>Code</Label>
                                    <Input
                                        type='text'
                                        id='code'
                                        value={createForm.data.code}
                                        onChange={(e) => createForm.setData('code', e.target.value)}
                                        placeholder='ITE101'
                                        className={createForm.errors.code ? "border-red-500" : ""}
                                    />
                                    {createForm.errors.code && <p className="text-xs text-red-500">{createForm.errors.code}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor='description'>Description</Label>
                                    <Input
                                        type='text'
                                        id='description'
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        placeholder='Optional details...'
                                        className={createForm.errors.description ? "border-red-500" : ""}
                                    />
                                    {createForm.errors.description && <p className="text-xs text-red-500">{createForm.errors.description}</p>}
                                </div>

                                <Button type='submit' className="w-full mt-2" disabled={createForm.processing}>
                                    {createForm.processing ? "Creating..." : "Create Subject"}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel: Subjects Table */}
                    <div className="w-full lg:w-2/3">
                        <div className="border rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                                    <TableRow>
                                        <TableHead className="w-12 text-center">
                                            <Checkbox
                                                checked={isAllSelected}
                                                onCheckedChange={toggleSelectAll}
                                                disabled={subjects.length === 0}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold">Code</TableHead>
                                        <TableHead className="font-bold">Title</TableHead>
                                        <TableHead className="hidden md:table-cell font-bold">Description</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjects.length > 0 ? (
                                        subjects.map((subject) => {
                                            const isSelected = selectedIds.includes(subject.id);
                                            return (
                                                <TableRow
                                                    key={subject.id}
                                                    className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 ${isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                                                >
                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleSelectRow(subject.id)}
                                                            aria-label={`Select subject ${subject.title}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs font-bold text-blue-600">{subject.code}</TableCell>
                                                    <TableCell className="font-medium">{subject.title}</TableCell>
                                                    <TableCell className="hidden md:table-cell text-zinc-500 text-sm truncate max-w-[200px]">
                                                        {subject.description || <span className="italic opacity-50">No description</span>}
                                                    </TableCell>
                                                    <TableCell className='text-right'>
                                                        <div className="flex justify-end gap-2 relative z-10">
                                                            <Link href={route('subjects.show', subject.id)}>
                                                                <Button
                                                                    type="button"
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-8 w-8 cursor-pointer'
                                                                >
                                                                    <Eye className="w-4 h-4 pointer-events-none" />
                                                                </Button>
                                                            </Link>

                                                            {/* EDIT BUTTON FIX */}
                                                            <Button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleOpenEditModal(subject);
                                                                }}
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer'
                                                            >
                                                                <Edit className="w-4 h-4 pointer-events-none" />
                                                            </Button>

                                                            {/* DELETE BUTTON */}
                                                            <Button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setDeletingSubject({ id: subject.id, title: subject.title });
                                                                }}
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer'
                                                            >
                                                                <Trash2 className="w-4 h-4 pointer-events-none" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center text-zinc-500">
                                                    <BookOpen className="w-10 h-10 mb-2 opacity-20" />
                                                    <p className="font-medium">No subjects available</p>
                                                    <p className="text-sm opacity-70">Add your first subject using the form.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* EDIT SUBJECT DIALOG */}
                    <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Subject</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-title">Title</Label>
                                    <Input
                                        id="edit-title"
                                        value={editForm.data.title}
                                        placeholder="Web Development"
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        className={editForm.errors.title ? "border-red-500" : ""}
                                    />
                                    {editForm.errors.title && (
                                        <p className="text-xs text-red-500">{editForm.errors.title}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-code">Code</Label>
                                    <Input
                                        id="edit-code"
                                        value={editForm.data.code}
                                        placeholder="ITE101"
                                        onChange={(e) => editForm.setData('code', e.target.value)}
                                        className={editForm.errors.code ? "border-red-500" : ""}
                                    />
                                    {editForm.errors.code && (
                                        <p className="text-xs text-red-500">{editForm.errors.code}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Input
                                        id="edit-description"
                                        value={editForm.data.description}
                                        placeholder="Optional details..."
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        className={editForm.errors.description ? "border-red-500" : ""}
                                    />
                                    {editForm.errors.description && (
                                        <p className="text-xs text-red-500">{editForm.errors.description}</p>
                                    )}
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setEditingSubject(null)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing}>
                                        {editForm.processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* SINGLE DELETE CONFIRMATION DIALOG */}
                    <AlertDialog open={!!deletingSubject} onOpenChange={(open) => !open && setDeletingSubject(null)}>
                        <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                            <AlertDialogHeader>
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                                    Delete Subject
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                                    Are you sure you want to delete <span className="font-extrabold text-red-600 dark:text-red-400">"{deletingSubject?.title}"</span>? This action is permanent and cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                                <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (deletingSubject) {
                                            confirmSingleDelete(deletingSubject.id);
                                            setDeletingSubject(null);
                                        }
                                    }}
                                    className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Confirm Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* BULK DELETE CONFIRMATION DIALOG */}
                    <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                        <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                            <AlertDialogHeader>
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                                    Delete Selected Subjects
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                                    You are about to purge <span className="font-extrabold text-red-600 dark:text-red-400">{selectedIds.length} selected subject(s)</span> from the system.
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
                                    Delete Selected
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                </div>
            </div>
        </AppLayout>
    );
}
