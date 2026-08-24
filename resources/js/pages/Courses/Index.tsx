import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { BookOpenText, Layers3, Edit, Trash2, FilterX, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Academic Management',
        href: '/courses'
    }
];

interface Course {
    id: number;
    name: string;
    abbreviation: string;
}

interface Section {
    id: number;
    name: string;
    year_level: number;
    course_id: number;
    course: Course;
}

interface Props {
    courses: Course[];
    sections: Section[];
}

export default function Index({ courses, sections }: Props) {
    const [editCourseData, setEditCourseData] = useState<Course | null>(null);
    const [editSectionData, setEditSectionData] = useState<Section | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ id: number; title: string; type: 'courses' | 'sections' } | null>(null);

    const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
    const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');

    const courseForm = useForm({
        name: '',
        abbreviation: '',
    });

    const sectionForm = useForm({
        name: '',
        course_id: '',
        year_level: '',
    });

    const courseEditForm = useForm({
        name: '',
        abbreviation: ''
    });

    const sectionEditForm = useForm({
        name: '',
        course_id: '',
        year_level: ''
    });

    const handleCourseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        courseForm.post(route('courses.store'), {
            onSuccess: () => courseForm.reset()
        });
    };

    const handleCourseUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        courseEditForm.put(route('courses.update', editCourseData?.id), {
            onSuccess: () => setEditCourseData(null)
        });
    };

    const handleSectionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sectionForm.post(route('sections.store'), {
            onSuccess: () => sectionForm.reset()
        });
    };

    const handleSectionUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        sectionEditForm.put(route('sections.update', editSectionData?.id), {
            onSuccess: () => setEditSectionData(null)
        });
    };

    const confirmDelete = () => {
        if (!deletingItem) return;
        router.delete(route(`${deletingItem.type}.destroy`, deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    const availableYears = useMemo(() => {
        const years = sections.map((s) => s.year_level);
        return Array.from(new Set(years)).sort((a, b) => a - b);
    }, [sections]);

    const filteredSections = useMemo(() => {
        return sections.filter((section) => {
            const matchesCourse =
                selectedCourseFilter === 'all' || section.course_id.toString() === selectedCourseFilter;
            const matchesYear =
                selectedYearFilter === 'all' || section.year_level.toString() === selectedYearFilter;
            return matchesCourse && matchesYear;
        });
    }, [sections, selectedCourseFilter, selectedYearFilter]);

    const resetFilters = () => {
        setSelectedCourseFilter('all');
        setSelectedYearFilter('all');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Academic Management" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6 border-b pb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Academic Management</h1>
                    <p className="text-sm text-zinc-500">Manage your courses and sections.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Course Form & Table */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 text-blue-600">
                                <BookOpenText className="w-5 h-5" />
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">New Course</h2>
                            </div>
                            <form onSubmit={handleCourseSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className={courseForm.errors.name ? 'text-red-500' : ''}>Course Name</Label>
                                    <Input
                                        className={courseForm.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                        value={courseForm.data.name}
                                        onChange={(e) => courseForm.setData('name', e.target.value)}
                                        placeholder="e.g. BS Information Systems"
                                    />
                                    {courseForm.errors.name && <p className="text-xs text-red-500">{courseForm.errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label className={courseForm.errors.abbreviation ? 'text-red-500' : ''}>Abbreviation</Label>
                                    <Input
                                        className={courseForm.errors.abbreviation ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                        value={courseForm.data.abbreviation}
                                        onChange={(e) => courseForm.setData('abbreviation', e.target.value)}
                                        placeholder="e.g BSIS"
                                    />
                                    {courseForm.errors.abbreviation && <p className="text-xs text-red-500">{courseForm.errors.abbreviation}</p>}
                                </div>
                                <Button className="w-full" disabled={courseForm.processing}>
                                    Add Course
                                </Button>
                            </form>
                        </div>

                        <div className="border rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">
                                                {c.name} ({c.abbreviation})
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer"
                                                    onClick={() => {
                                                        setEditCourseData(c);
                                                        courseEditForm.setData({ name: c.name, abbreviation: c.abbreviation });
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                                                    onClick={() => setDeletingItem({ id: c.id, title: c.name, type: 'courses' })}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Section Form & Table */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 text-green-600">
                                <Layers3 className="w-5 h-5" />
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">New Section</h2>
                            </div>
                            <form onSubmit={handleSectionSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className={sectionForm.errors.course_id ? 'text-red-500' : ''}>Parent Course</Label>
                                    <Select onValueChange={(v) => sectionForm.setData('course_id', v)} value={sectionForm.data.course_id}>
                                        <SelectTrigger className={sectionForm.errors.course_id ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                                            <SelectValue placeholder="Select Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.name} ({c.abbreviation})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {sectionForm.errors.course_id && <p className="text-xs text-red-500">The course selection field is required.</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className={sectionForm.errors.year_level ? 'text-red-500' : ''}>Year</Label>
                                        <Input
                                            className={sectionForm.errors.year_level ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            type="number"
                                            value={sectionForm.data.year_level}
                                            placeholder="e.g 1"
                                            onChange={(e) => sectionForm.setData('year_level', e.target.value)}
                                        />
                                        {sectionForm.errors.year_level && <p className="text-xs text-red-500">{sectionForm.errors.year_level}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className={sectionForm.errors.name ? 'text-red-500' : ''}>Section</Label>
                                        <Input
                                            className={sectionForm.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            value={sectionForm.data.name}
                                            placeholder="e.g 1"
                                            onChange={(e) => sectionForm.setData('name', e.target.value)}
                                        />
                                        {sectionForm.errors.name && <p className="text-xs text-red-500">{sectionForm.errors.name}</p>}
                                    </div>
                                </div>
                                <Button className="w-full" disabled={sectionForm.processing}>
                                    Add Section
                                </Button>
                            </form>
                        </div>

                        <div className="border rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-zinc-50/50 dark:bg-zinc-800/50 flex flex-wrap items-center gap-3">
                                <div className="flex-1 min-w-[140px]">
                                    <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
                                        <SelectTrigger className="h-8 text-xs bg-white dark:bg-zinc-900">
                                            <SelectValue placeholder="Filter Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Courses</SelectItem>
                                            {courses.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.abbreviation}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                |
                                <div className="w-[120px]">
                                    <Select value={selectedYearFilter} onValueChange={setSelectedYearFilter}>
                                        <SelectTrigger className="h-8 text-xs bg-white dark:bg-zinc-900">
                                            <SelectValue placeholder="Filter Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Years</SelectItem>
                                            {availableYears.map((yr) => (
                                                <SelectItem key={yr} value={yr.toString()}>
                                                    Year {yr}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(selectedCourseFilter !== 'all' || selectedYearFilter !== 'all') && (
                                    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs text-zinc-500 hover:text-zinc-900">
                                        <FilterX className="w-3.5 h-3.5 mr-1" /> Reset
                                    </Button>
                                )}
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Sec</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSections.length > 0 ? (
                                        filteredSections.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell>
                                                    {s.course.abbreviation} - {s.year_level}
                                                </TableCell>
                                                <TableCell className="font-bold">{s.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer"
                                                        onClick={() => {
                                                            setEditSectionData(s);
                                                            sectionEditForm.setData({
                                                                name: s.name,
                                                                course_id: s.course_id.toString(),
                                                                year_level: s.year_level.toString()
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                                                        onClick={() => setDeletingItem({ id: s.id, title: `${s.course.abbreviation} ${s.year_level}-${s.name}`, type: 'sections' })}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-xs text-zinc-500 py-6">
                                                No sections match the selected filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Edit Dialog */}
            <Dialog open={!!editCourseData} onOpenChange={() => setEditCourseData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Course</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCourseUpdate} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label className={courseEditForm.errors.name ? 'text-red-500' : ''}>Name</Label>
                            <Input
                                className={courseEditForm.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                value={courseEditForm.data.name}
                                placeholder="e.g BS Information Systems"
                                onChange={(e) => courseEditForm.setData('name', e.target.value)}
                            />
                            {courseEditForm.errors.name && <p className="text-xs text-red-500">{courseEditForm.errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label className={courseEditForm.errors.abbreviation ? 'text-red-500' : ''}>Abbr</Label>
                            <Input
                                className={courseEditForm.errors.abbreviation ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                value={courseEditForm.data.abbreviation}
                                placeholder="e.g BSIS"
                                onChange={(e) => courseEditForm.setData('abbreviation', e.target.value)}
                            />
                            {courseEditForm.errors.abbreviation && <p className="text-xs text-red-500">{courseEditForm.errors.abbreviation}</p>}
                        </div>
                        <DialogFooter>
                            <Button disabled={courseEditForm.processing}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Section Edit Dialog */}
            <Dialog open={!!editSectionData} onOpenChange={() => setEditSectionData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Section</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSectionUpdate} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label className={sectionEditForm.errors.course_id ? 'text-red-500' : ''}>Course</Label>
                            <Select onValueChange={(v) => sectionEditForm.setData('course_id', v)} value={sectionEditForm.data.course_id}>
                                <SelectTrigger className={sectionEditForm.errors.course_id ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {sectionEditForm.errors.course_id && <p className="text-xs text-red-500">{sectionEditForm.errors.course_id}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className={sectionEditForm.errors.year_level ? 'text-red-500' : ''}>Year</Label>
                                <Input
                                    className={sectionEditForm.errors.year_level ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                    type="number"
                                    value={sectionEditForm.data.year_level}
                                    placeholder="e.g 1"
                                    onChange={(e) => sectionEditForm.setData('year_level', e.target.value)}
                                />
                                {sectionEditForm.errors.year_level && <p className="text-xs text-red-500">{sectionEditForm.errors.year_level}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label className={sectionEditForm.errors.name ? 'text-red-500' : ''}>Section</Label>
                                <Input
                                    className={sectionEditForm.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                    value={sectionEditForm.data.name}
                                    placeholder="e.g 1"
                                    onChange={(e) => sectionEditForm.setData('name', e.target.value)}
                                />
                                {sectionEditForm.errors.name && <p className="text-xs text-red-500">{sectionEditForm.errors.name}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button disabled={sectionEditForm.processing}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/*Delete Dialog */}
            <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                            Delete {deletingItem?.type === 'courses' ? 'Course' : 'Section'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                            Are you sure you want to delete <span className="font-extrabold text-red-600 dark:text-red-400">{deletingItem?.title}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
