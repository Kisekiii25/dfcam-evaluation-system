import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, PlusCircle, ArrowLeft, Pencil, Trash2, X } from 'lucide-react';

interface Props {
    teacher: any;
    subjects: any[];
    sections: any[];
}

export default function Show({ teacher, subjects, sections }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Assign Teachers',
            href: '/teachers',
        },
    ];

    // Create / Assign Form State
    const { data, setData, post, processing, reset, errors } = useForm({
        teacher_id: teacher.id,
        subject_id: '',
        section_id: '',
        academic_year: '2025-2026',
        semester: '1',
    });

    // Edit Modal State & Form
    const [editingLoad, setEditingLoad] = useState<any | null>(null);
    const editForm = useForm({
        subject_id: '',
        section_id: '',
        academic_year: '',
        semester: '',
    });

    // Bulk Delete Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Checkbox Helper Styles
    const checkboxClass = "border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600";

    // Handle Create Submit
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('teaching-loads.store'), {
            onSuccess: () => reset('subject_id', 'section_id'),
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (load: any) => {
        setEditingLoad(load);
        editForm.setData({
            subject_id: load.subject_id.toString(),
            section_id: load.section_id.toString(),
            academic_year: load.academic_year,
            semester: load.semester.toString(),
        });
    };

    // Submit Edit
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(route('teaching-loads.update', editingLoad.id), {
            onSuccess: () => setEditingLoad(null),
        });
    };

    // Handle Single Delete
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this teaching load?')) {
            router.delete(route('teaching-loads.destroy', id));
        }
    };

    // Checkbox Handlers for Bulk Actions
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(teacher.teaching_loads.map((load: any) => load.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Handle Bulk Delete Submit
    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`)) {
            router.delete(route('teaching-loads.bulk-destroy'), {
                data: { ids: selectedIds },
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const totalLoads = teacher.teaching_loads?.length || 0;
    const isAllSelected = totalLoads > 0 && selectedIds.length === totalLoads;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < totalLoads;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Profile - ${teacher.name}`} />

            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="mb-8 border-b pb-6 flex justify-between items-center flex-wrap gap-4">
                    <div className='flex gap-4'>
                        <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <User className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                {teacher.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="font-mono text-indigo-600 border-indigo-200">
                                    {teacher.employee_id}
                                </Badge>
                                <span className="text-sm text-zinc-500">• Faculty Member</span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={route('teachers.index')}
                        className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-2"}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to List</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: TEACHING LOAD LIST */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-zinc-400" />
                                <h2 className="text-lg font-semibold">Assigned Teaching Loads</h2>
                            </div>

                            {/* Bulk Delete Trigger */}
                            {selectedIds.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    className="gap-2 animate-in fade-in duration-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Selected ({selectedIds.length})</span>
                                </Button>
                            )}
                        </div>

                        {/* Styled Table Container */}
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
                                        <TableHead className="font-bold">Subject</TableHead>
                                        <TableHead className="font-bold">Section</TableHead>
                                        <TableHead className="font-bold text-center w-[100px]">Term</TableHead>
                                        <TableHead className="font-bold text-center w-[140px]">Academic Year</TableHead>
                                        <TableHead className="text-right font-bold pr-6 w-[120px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teacher.teaching_loads?.length > 0 ? (
                                        teacher.teaching_loads.map((load: any) => {
                                            const isSelected = selectedIds.includes(load.id);
                                            return (
                                                <TableRow
                                                    key={load.id}
                                                    className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                                                        isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                                                    }`}
                                                >
                                                    <TableCell className="text-center pl-4">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleSelectOne(load.id)}
                                                            aria-label={`Select item ${load.id}`}
                                                            className={checkboxClass}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                                                        {load.subject?.title}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-normal">
                                                            {load.section?.course?.abbreviation} {load.section?.year_level}-{load.section?.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">
                                                        {load.semester === '1' ? '1st Sem' : '2nd Sem'}
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm text-zinc-500 font-mono">
                                                        {load.academic_year}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-zinc-500 hover:text-indigo-600"
                                                                onClick={() => handleOpenEdit(load)}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-zinc-500 hover:text-red-600"
                                                                onClick={() => handleDelete(load.id)}
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
                                            <TableCell colSpan={6} className="h-32 text-center text-zinc-400">
                                                No subjects assigned to this instructor yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* RIGHT: ASSIGNMENT FORM */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm sticky top-6">
                            <div className="flex items-center gap-2 mb-6">
                                <PlusCircle className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Assign New Load</h2>
                            </div>

                            <form onSubmit={submit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-zinc-500">Subject</Label>
                                    <Select onValueChange={(val) => setData('subject_id', val)} value={data.subject_id}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.subject_id && <p className="text-xs text-red-500">{errors.subject_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-zinc-500">Section</Label>
                                    <Select onValueChange={(val) => setData('section_id', val)} value={data.section_id}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((sec) => (
                                                <SelectItem key={sec.id} value={sec.id.toString()}>
                                                    {sec.course?.abbreviation} {sec.year_level} - {sec.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.section_id && <p className="text-xs text-red-500">{errors.section_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-zinc-500 italic">Academic Year</Label>
                                        <Select defaultValue="2025-2026" onValueChange={(val) => setData('academic_year', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2025-2026">2025-2026</SelectItem>
                                                <SelectItem value="2026-2027">2026-2027</SelectItem>
                                                <SelectItem value="2027-2028">2027-2028</SelectItem>
                                                <SelectItem value="2028-2029">2028-2029</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-zinc-500 italic">Semester</Label>
                                        <Select defaultValue="1" onValueChange={(val) => setData('semester', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1st Sem</SelectItem>
                                                <SelectItem value="2">2nd Sem</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                                    disabled={processing}
                                >
                                    {processing ? "Processing..." : "Confirm Assignment"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editingLoad && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                Edit Teaching Load
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingLoad(null)}
                                className="h-8 w-8 text-zinc-500"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-zinc-500">Subject</Label>
                                <Select
                                    value={editForm.data.subject_id}
                                    onValueChange={(val) => editForm.setData('subject_id', val)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.subject_id && (
                                    <p className="text-xs text-red-500">{editForm.errors.subject_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-zinc-500">Section</Label>
                                <Select
                                    value={editForm.data.section_id}
                                    onValueChange={(val) => editForm.setData('section_id', val)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map((sec) => (
                                            <SelectItem key={sec.id} value={sec.id.toString()}>
                                                {sec.course?.abbreviation} {sec.year_level} - {sec.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.section_id && (
                                    <p className="text-xs text-red-500">{editForm.errors.section_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-zinc-500">Academic Year</Label>
                                    <Select
                                        value={editForm.data.academic_year}
                                        onValueChange={(val) => editForm.setData('academic_year', val)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2025-2026">2025-2026</SelectItem>
                                            <SelectItem value="2026-2027">2026-2027</SelectItem>
                                            <SelectItem value="2027-2028">2027-2028</SelectItem>
                                            <SelectItem value="2028-2029">2028-2029</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-zinc-500">Semester</Label>
                                    <Select
                                        value={editForm.data.semester}
                                        onValueChange={(val) => editForm.setData('semester', val)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1st Sem</SelectItem>
                                            <SelectItem value="2">2nd Sem</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingLoad(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
