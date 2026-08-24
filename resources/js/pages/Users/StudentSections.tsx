import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, UserCog, GraduationCap, School, ArrowLeft, Layers, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Section {
    id: number;
    name: string;
    year_level: string;
    course?: {
        name: string;
    };
}

interface Student {
    id: number;
    name: string;
    email: string;
    section_id: number | null;
    section: Section | null;
}

interface StudentSectionsProps {
    students: Student[];
    sections: Section[];
}

const ITEMS_PER_PAGE = 10;

export default function StudentSections({ students = [], sections = [] }: StudentSectionsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: 'Section Assignments', href: '/admin/students/sections' },
    ];

    const { data, setData, post, patch, processing, reset } = useForm({
        section_id: '',
        student_ids: [] as number[],
    });

    // Reset pagination when filter criteria change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSectionFilter]);

    // Master filtered dataset
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.section?.name ?? 'unassigned').toLowerCase().includes(searchTerm.toLowerCase());

            let matchesSection = true;
            if (selectedSectionFilter === 'unassigned') {
                matchesSection = student.section_id === null;
            } else if (selectedSectionFilter !== 'all') {
                matchesSection = String(student.section_id) === selectedSectionFilter;
            }

            return matchesSearch && matchesSection;
        });
    }, [students, searchTerm, selectedSectionFilter]);

    // Paginated subset (10 items per page)
    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredStudents, currentPage]);

    const startIndex = filteredStudents.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedStudents.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedStudents.map(student => student.id));
        }
    };

    const toggleSelectStudent = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleOpenSingleModal = (student: Student) => {
        setIsBulkMode(false);
        setSelectedStudent(student);
        setData(sub => ({
            ...sub,
            section_id: student.section_id ? String(student.section_id) : 'unassigned',
            student_ids: []
        }));
        setIsModalOpen(true);
    };

    const handleOpenBulkModal = () => {
        setIsBulkMode(true);
        setSelectedStudent(null);
        setData(sub => ({
            ...sub,
            section_id: 'unassigned',
            student_ids: selectedIds
        }));
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payloadId = data.section_id === 'unassigned' ? null : data.section_id;

        if (isBulkMode) {
            post(route('admin.students.sections.bulk-update'), {
                data: { section_id: payloadId, student_ids: selectedIds },
                onSuccess: () => {
                    setIsModalOpen(false);
                    setSelectedIds([]);
                    reset();
                },
            });
        } else {
            if (!selectedStudent) return;
            patch(route('admin.students.section.update', selectedStudent.id), {
                data: { section_id: payloadId },
                onSuccess: () => {
                    setIsModalOpen(false);
                    setSelectedStudent(null);
                    reset();
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Section Assignment" />

            <div className="p-4 sm:p-6 lg:p-8">

                {/* Header/Back Action */}
                <div className="flex items-center justify-between border-b pb-6 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Student Section Alignment
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Map student accounts to their current class sections to enforce evaluation boundaries.
                        </p>
                    </div>

                    <Link
                        href={route('users.index')}
                        className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-2"}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to User Directory</span>
                    </Link>
                </div>

                {/* FILTERS AND ACTIONS */}
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <Input
                                type="text"
                                placeholder="Filter by student name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white dark:bg-zinc-900 shadow-sm"
                            />
                        </div>

                        {/* DESCRIPTIVE SECTION FILTER DROPDOWN */}
                        <div className="cursor-pointer w-full sm:w-72" >
                            <Select
                                value={selectedSectionFilter}
                                onValueChange={(value) => setSelectedSectionFilter(value)}
                            >
                                <SelectTrigger className="bg-white dark:bg-zinc-900 shadow-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <SelectValue placeholder="Filter by section" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Students</SelectItem>
                                    <SelectItem value="unassigned" className="text-amber-600 dark:text-amber-400 font-medium">
                                        Unassigned Only
                                    </SelectItem>
                                    {sections.map((section) => (
                                        <SelectItem key={section.id} value={String(section.id)}>
                                            {section.course?.name ?? 'Course'} - Year {section.year_level} (Sec {section.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectedIds.length > 0 && (
                        <Button
                            onClick={handleOpenBulkModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-1.5 self-start sm:self-auto animate-in fade-in zoom-in-95 duration-150 cursor-pointer"
                        >
                            <Layers className="w-4 h-4" /> Batch Assign Section ({selectedIds.length})
                        </Button>
                    )}
                </div>

                {/* TABLE DISPLAY */}
                <div className="w-full border rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                            <TableRow>
                                <TableHead className="w-[50px] pl-4">
                                    <Checkbox
                                        className="border-zinc-300 dark:border-zinc-700 cursor-pointer"
                                        checked={paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="font-bold">Student Details</TableHead>
                                <TableHead className="font-bold">Assigned Curricular Load Scope</TableHead>
                                <TableHead className="text-right font-bold pr-6">Operations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedStudents.length > 0 ? (
                                paginatedStudents.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                        <TableCell className="pl-4">
                                            <Checkbox
                                                className="border-zinc-300 dark:border-zinc-700 cursor-pointer"
                                                checked={selectedIds.includes(student.id)}
                                                onCheckedChange={() => toggleSelectStudent(student.id)}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                                    {student.name}
                                                </span>
                                                <span className="text-xs text-zinc-500 truncate max-w-[150px] sm:max-w-none">
                                                    {student.email}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {student.section ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                        Section {student.section.name}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400 font-medium">
                                                        {student.section.course?.name} • Year {student.section.year_level}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-700">
                                                    Unassigned Pool
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenSingleModal(student)}
                                                className="h-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1.5 cursor-pointer"
                                            >
                                                <UserCog className="w-4 h-4" /> Change Section
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center text-zinc-500">
                                            <GraduationCap className="w-10 h-10 mb-2 opacity-20" />
                                            <p className="font-medium">No student records found</p>
                                            <p className="text-sm opacity-70">Adjust your criteria or verify role registrations.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* PAGINATION FOOTER CONTROL BAR */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-zinc-50/50 dark:bg-zinc-800/30 gap-3">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{startIndex}</span> to <span className="font-medium text-zinc-900 dark:text-zinc-100">{endIndex}</span> of <span className="font-medium text-zinc-900 dark:text-zinc-100">{filteredStudents.length}</span> users
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="h-8 text-xs gap-1 cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage >= totalPages || totalPages === 0}
                                className="h-8 text-xs gap-1 cursor-pointer"
                            >
                                Next <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        
                    </div>
                </div>


                {/* MODAL DIALOG */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                <School className="w-5 h-5 text-indigo-600" />
                                {isBulkMode ? `Batch Assign ${selectedIds.length} Students` : 'Reassign Student Section'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            {!isBulkMode && selectedStudent && (
                                <div className="space-y-1">
                                    <Label className="text-zinc-400 text-xs">Target Account</Label>
                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{selectedStudent.name}</p>
                                    <p className="text-xs text-zinc-500 font-mono">{selectedStudent.email}</p>
                                </div>
                            )}

                            {isBulkMode && (
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 border border-dashed">
                                    You are changing the structural class assignment roster properties for <strong className="text-indigo-600 dark:text-indigo-400">{selectedIds.length} profiles</strong> simultaneously.
                                </div>
                            )}

                            <div className="grid gap-2 pt-2">
                                <Label htmlFor="section-select" className="font-medium">Select Target Class Section</Label>
                                <Select
                                    value={data.section_id}
                                    onValueChange={(val) => setData('section_id', val)}
                                >
                                    <SelectTrigger id="section-select" className="w-full bg-white dark:bg-zinc-900">
                                        <SelectValue placeholder="Choose new class structure assignment..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned" className="text-zinc-400 italic">
                                            Leave in Unassigned Pool (None)
                                        </SelectItem>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={String(section.id)}>
                                                {section.course?.name ?? 'Course'} - Year {section.year_level} (Sec {section.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="pt-4 border-t mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setIsModalOpen(false); setSelectedStudent(null); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    disabled={processing}
                                >
                                    {processing ? "Saving Changes..." : "Apply Mapping"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
