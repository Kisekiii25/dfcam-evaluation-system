import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    GripVertical, Plus, ListChecks, Settings2, HelpCircle,
    CalendarDays, Clock, Save, FileText, Layers, LayoutGrid, Trash2,
    Pencil, Check, X, AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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

const breadcrumbs = [{ title: 'Questionnaire Builder', href: '/questions' }];

// Helper function to generate Academic Year options dynamically
const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 3; i++) {
        const start = currentYear + i;
        years.push(`${start}-${start + 1}`);
    }
    return years;
};

// --- SORTABLE CATEGORY ITEM (WITH INLINE EDITING) ---
function SortableCategoryItem({
    cat,
    onDelete,
    onUpdate
}: {
    cat: any;
    onDelete: (id: number) => void;
    onUpdate: (id: number, newName: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(cat.name);

    useEffect(() => {
        setName(cat.name);
    }, [cat.name]);

    const handleSave = () => {
        if (!name.trim()) return;
        onUpdate(cat.id, name);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(cat.name);
        setIsEditing(false);
    };

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border rounded-lg transition-all ${isDragging ? 'shadow-lg border-indigo-500 scale-105' : 'hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm'
                }`}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
                <GripVertical className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
            </div>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-8 text-xs font-semibold"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                        }}
                    />
                ) : (
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{cat.name}</p>
                )}
            </div>

            <div className="flex items-center gap-1">
                {isEditing ? (
                    <>
                        <Button variant="ghost" size="icon" onClick={handleSave} className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                            <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel} className="h-7 w-7 text-zinc-400 hover:text-zinc-600">
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="h-7 w-7 text-zinc-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(cat)}
                            className="h-7 w-7 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

// --- SORTABLE QUESTION ROW ---
function SortableQuestionRow({
    q,
    isSelected,
    onSelect,
    onEdit,
    onDelete
}: {
    q: any;
    isSelected: boolean;
    onSelect: (id: number, checked: boolean) => void;
    onEdit: (q: any) => void;
    onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <TableRow ref={setNodeRef} style={style} className={`bg-white dark:bg-zinc-900 group ${isDragging ? 'opacity-50 shadow-inner' : ''}`}>
            <TableCell className="w-[40px]">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(q.id, checked as boolean)}
                />
            </TableCell>
            <TableCell className="w-[40px]">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
                    <GripVertical className="w-4 h-4 text-zinc-400" />
                </div>
            </TableCell>
            <TableCell className="w-[200px]">
                <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 border-none px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                    {q.category?.name || 'Uncategorized'}
                </Badge>
            </TableCell>
            <TableCell className="w-[300px] whitespace-normal! break-all! py-3">
                {q.question_text}
            </TableCell>
            <TableCell className="text-right w-[140px]">
                <Badge variant="outline" className={q.type === 'rating' ? 'border-blue-200 text-blue-600' : 'border-emerald-200 text-emerald-600'}>
                    {q.type === 'rating' ? '1-5 Scale' : 'Comment'}
                </Badge>
            </TableCell>
            <TableCell className="w-[100px] text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(q)}
                        className="h-8 w-8 text-zinc-400 hover:text-indigo-600"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(q.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

export default function Index({ questions, categories, settings }: any) {
    const [localQuestions, setLocalQuestions] = useState(questions);
    const [localCategories, setLocalCategories] = useState(categories);
    const [activeTab, setActiveTab] = useState<'questions' | 'schedule'>('questions');
    const [isLive, setIsLive] = useState(false);

    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);

    // --- ADDED STATES FOR DIALOGS ---
    const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState<boolean>(false);

    const academicYears = generateAcademicYears();

    useEffect(() => { setLocalQuestions(questions); }, [questions]);
    useEffect(() => { setLocalCategories(categories); }, [categories]);

    useEffect(() => {
        if (settings?.start_date && settings?.end_date) {
            const now = new Date();
            const start = new Date(settings.start_date);
            const end = new Date(settings.end_date);
            setIsLive(now >= start && now <= end);
        }
    }, [settings]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const categoryForm = useForm({ name: '' });
    const questionForm = useForm({ question_text: '', category_id: '', type: 'rating' });
    const editQuestionForm = useForm({ question_text: '', category_id: '', type: 'rating' });
    const settingsForm = useForm({
        academic_year: settings?.academic_year || academicYears[2],
        semester: settings?.semester || '1st Semester',
        start_date: settings?.start_date ? settings.start_date.slice(0, 16) : '',
        end_date: settings?.end_date ? settings.end_date.slice(0, 16) : '',
    });

    const handleUpdateCategory = (id: number, newName: string) => {
        router.put(route('categories.update', id), { name: newName }, { preserveScroll: true });
    };

    const handleDeleteCategory = (id: number) => {
        if (!id) return;

        router.delete(route('categories.destroy', { category: id }), {
            preserveScroll: true,
            onSuccess: () => {
                // Optional success toast
            },
        });
    };

    const handleOpenEditQuestion = (q: any) => {
        setEditingQuestion(q);
        editQuestionForm.setData({
            question_text: q.question_text,
            category_id: q.category_id ? q.category_id.toString() : '',
            type: q.type || 'rating',
        });
    };

    const handleUpdateQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingQuestion) return;

        editQuestionForm.put(route('questions.update', editingQuestion.id), {
            preserveScroll: true,
            onSuccess: () => setEditingQuestion(null),
        });
    };

    // --- UPDATED: Removed window.confirm() (AlertDialog handles confirmation now) ---
    const handleDeleteQuestion = (id: number) => {
        if (!id) return; // Prevents Ziggy from crashing if id is missing

        router.delete(route('questions.destroy', { question: id }), {
            preserveScroll: true,
            onSuccess: () => setSelectedQuestions((prev) => prev.filter((qId) => qId !== id)),
        });
    };

    // --- UPDATED: Removed window.confirm() (AlertDialog handles confirmation now) ---
    const handleBulkDeleteQuestions = () => {
        if (!selectedQuestions.length) return;
        router.post(
            route('questions.bulk-destroy'),
            { ids: selectedQuestions },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedQuestions([]),
            }
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedQuestions(localQuestions.map((q: any) => q.id));
        } else {
            setSelectedQuestions([]);
        }
    };

    const handleSelectQuestion = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedQuestions((prev) => [...prev, id]);
        } else {
            setSelectedQuestions((prev) => prev.filter((qId) => qId !== id));
        }
    };

    const submitCategory = (e: React.FormEvent) => {
        e.preventDefault();
        categoryForm.post(route('categories.store'), { onSuccess: () => categoryForm.reset() });
    };

    const submitQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        questionForm.post(route('questions.store'), { onSuccess: () => questionForm.reset('question_text') });
    };

    const submitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post(route('settings.evaluation.update'), { preserveScroll: true });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = localQuestions.findIndex((q: any) => q.id === active.id);
            const newIndex = localQuestions.findIndex((q: any) => q.id === over.id);
            const newOrder = arrayMove(localQuestions, oldIndex, newIndex);
            setLocalQuestions(newOrder);
            router.patch(route('questions.reorder'), { ids: newOrder.map((q: any) => q.id) }, { preserveScroll: true });
        }
    };

    const handleCategoryDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = localCategories.findIndex((c: any) => c.id === active.id);
            const newIndex = localCategories.findIndex((c: any) => c.id === over.id);
            const newOrder = arrayMove(localCategories, oldIndex, newIndex);
            setLocalCategories(newOrder);
            router.patch(route('categories.reorder'), { ids: newOrder.map((c: any) => c.id) }, { preserveScroll: true });
        }
    };
    const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Questionnaire Builder" />

            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

                {/* Header & Stats Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Evaluation Manager</h1>
                            {isLive ? (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 animate-pulse">● LIVE PORTAL</Badge>
                            ) : (
                                <Badge variant="secondary" className="px-3 py-1">○ STATUS: CLOSED</Badge>
                            )}
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400">Design your questionnaire and manage student evaluation windows.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <button onClick={() => setActiveTab('questions')} className={`cursor-pointer flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'questions' ? 'bg-white dark:bg-zinc-900 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                <LayoutGrid className="w-4 h-4" /> Questions
                            </button>
                            <button onClick={() => setActiveTab('schedule')} className={`cursor-pointer flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'schedule' ? 'bg-white dark:bg-zinc-900 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                <Clock className="w-4 h-4" /> Schedule
                            </button>
                        </div>
                    </div>
                </div>

                <hr />

                {/* Stats Counters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 border rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-xl"><Layers className="text-emerald-600 w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Categories</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white">{localCategories.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 border rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl"><FileText className="text-indigo-600 w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Questions</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white">{localQuestions.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 border rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl"><CalendarDays className="text-amber-600 w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Current Semester</p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">{settingsForm.data.semester}</p>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                {activeTab === 'questions' ? (
                    <div className="space-y-8">
                        {/* TOP SECTION: Categories + Build Questionnaire Side-by-Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 items-start">
                            {/* CATEGORY SIDEBAR */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm flex flex-col h-[340px]">
                                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Settings2 className="w-5 h-5 text-indigo-600" />
                                            <h2 className="font-bold text-zinc-900 dark:text-white">Categories</h2>
                                        </div>
                                    </div>

                                    <form onSubmit={submitCategory} className="space-y-3 mb-4 flex-shrink-0">
                                        <Label className="text-xs font-bold text-zinc-400">ADD NEW CATEGORY</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g. Commitment..."
                                                value={categoryForm.data.name}
                                                onChange={e => categoryForm.setData('name', e.target.value)}
                                            />
                                            <Button
                                                size="icon"
                                                className="bg-indigo-600 shadow-lg dark:shadow-none flex-shrink-0"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </form>

                                    {/* INDEPENDENT SCROLL FOR CATEGORIES */}
                                    <div className="overflow-y-auto pr-1 flex-1">
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                                            <SortableContext items={localCategories.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2">
                                                    {localCategories.map((cat: any) => (
                                                        <SortableCategoryItem
                                                            key={cat.id}
                                                            cat={cat}
                                                            onDelete={(id) => setCategoryToDelete(cat)}
                                                            onUpdate={handleUpdateCategory}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                </div>
                            </div>

                            {/* MAIN QUESTION BUILDER */}
                            <div className="lg:col-span-4">
                                <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border rounded-2xl shadow-sm overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                                    <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                        <HelpCircle className="w-6 h-6 text-indigo-600" />
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Build Questionnaire</h2>
                                    </div>

                                    <form onSubmit={submitQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-xs font-black text-zinc-500 tracking-widest uppercase">The Question</Label>
                                            <Input className="h-12 text-lg" value={questionForm.data.question_text} onChange={e => questionForm.setData('question_text', e.target.value)} placeholder="Enter the evaluation statement..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-zinc-500 tracking-widest uppercase">Target Category</Label>
                                            <Select value={questionForm.data.category_id} onValueChange={val => questionForm.setData('category_id', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>{localCategories.map((cat: any) => (<SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>))}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-zinc-500 tracking-widest uppercase">Response Type</Label>
                                            <Select value={questionForm.data.type} onValueChange={val => questionForm.setData('type', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a response type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="rating">Numeric Scale (1 - 5)</SelectItem>
                                                    <SelectItem value="comment">Open Text Comment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button className="md:col-span-2 h-12 bg-indigo-600 hover:bg-indigo-700 font-bold text-md shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:translate-y-[-2px]" disabled={questionForm.processing}>
                                            {questionForm.processing ? "Adding..." : "Add to Questionnaire"}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM SECTION: Full-Width Active Questionnaire Table */}
                        <div className="w-full max-w-full min-w-0">
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">

                                {/* Header Bar */}
                                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
                                    <div className="flex items-center gap-2">
                                        <ListChecks className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-bold text-zinc-900 dark:text-white">Active Questionnaire</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {selectedQuestions.length > 0 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setIsBulkDeleteOpen(true)}
                                                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Selected ({selectedQuestions.length})
                                            </Button>
                                        )}
                                        <p className="text-xs text-zinc-400 font-medium italic hidden sm:block">Drag rows to reorder</p>
                                    </div>
                                </div>

                                {/* Table Container */}
                                <div className="w-full overflow-x-auto relative max-h-[600px]">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={localQuestions.map((q: any) => q.id)} strategy={verticalListSortingStrategy}>
                                            <Table className="w-full min-w-[800px]">
                                                <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 z-20 shadow-sm">
                                                    <TableRow>
                                                        <TableHead className="w-[50px] px-4">
                                                            <Checkbox
                                                                className="border-blue-500 cursor-pointer"
                                                                checked={
                                                                    localQuestions.length > 0 &&
                                                                    selectedQuestions.length === localQuestions.length
                                                                }
                                                                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                                            />
                                                        </TableHead>
                                                        <TableHead className="w-[40px]"></TableHead>
                                                        <TableHead className="font-bold text-zinc-700 dark:text-zinc-200">Category</TableHead>
                                                        <TableHead className="font-bold text-zinc-700 dark:text-zinc-200">Question Statement</TableHead>
                                                        <TableHead className="text-right font-bold text-zinc-700 dark:text-zinc-200">Type</TableHead>
                                                        <TableHead className="text-right font-bold pr-6 text-zinc-700 dark:text-zinc-200">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {localQuestions.length > 0 ? (
                                                        localQuestions.map((q: any) => (
                                                            <SortableQuestionRow
                                                                key={q.id}
                                                                q={q}
                                                                isSelected={selectedQuestions.includes(q.id)}
                                                                onSelect={handleSelectQuestion}
                                                                onEdit={handleOpenEditQuestion}
                                                                onDelete={setDeletingQuestion}
                                                            />
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="h-48 text-center">
                                                                <div className="flex flex-col items-center justify-center text-zinc-500 p-6">
                                                                    <LayoutGrid className="w-10 h-10 mb-2 opacity-20" />
                                                                    <p className="font-medium">Your questionnaire is empty.</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    /* SCHEDULE TAB CONTENT (UPDATED WITH DROPDOWNS & FULL-WIDTH BUTTON) */
                    <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border rounded-2xl shadow-sm">
                        <form onSubmit={submitSettings} className="space-y-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b pb-3">Evaluation Schedule Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-zinc-500 tracking-widest uppercase">Academic Year</Label>
                                    <Select
                                        value={settingsForm.data.academic_year}
                                        onValueChange={val => settingsForm.setData('academic_year', val)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select Academic Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((ay) => (
                                                <SelectItem key={ay} value={ay}>
                                                    A.Y. {ay}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-zinc-500 tracking-widest uppercase">Semester</Label>
                                    <Select
                                        value={settingsForm.data.semester}
                                        onValueChange={val => settingsForm.setData('semester', val)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select Semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1st Semester">1st Semester</SelectItem>
                                            <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                                            <SelectItem value="Summer / Midyear">Summer / Midyear</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-zinc-500 tracking-widest uppercase">Start Date & Time</Label>
                                    <Input
                                        type="datetime-local"
                                        className="h-10"
                                        value={settingsForm.data.start_date}
                                        onChange={e => settingsForm.setData('start_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-zinc-500 tracking-widest uppercase">End Date & Time</Label>
                                    <Input
                                        type="datetime-local"
                                        className="h-10"
                                        value={settingsForm.data.end_date}
                                        onChange={e => settingsForm.setData('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* FULL-WIDTH BUTTON */}
                            <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold text-md shadow-lg shadow-indigo-100 dark:shadow-none transition-all" disabled={settingsForm.processing}>
                                <Save className="w-4 h-4 mr-2" /> Save Schedule Configuration
                            </Button>
                        </form>
                    </div>
                )}
            </div>

            {/* EDIT QUESTION DIALOG */}
            <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Question Statement</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateQuestion} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Input
                                value={editQuestionForm.data.question_text}
                                onChange={(e) => editQuestionForm.setData('question_text', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={editQuestionForm.data.category_id}
                                onValueChange={(val) => editQuestionForm.setData('category_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {localCategories.map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Response Type</Label>
                            <Select
                                value={editQuestionForm.data.type}
                                onValueChange={(val) => editQuestionForm.setData('type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rating">Numeric Scale (1 - 5)</SelectItem>
                                    <SelectItem value="comment">Open Text Comment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setEditingQuestion(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={editQuestionForm.processing}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Single Question Delete Dialog */}
            <AlertDialog open={!!deletingQuestion} onOpenChange={(open) => !open && setDeletingQuestion(null)}>
                <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                            Delete Question
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                            Are you sure you want to delete this<span className="font-extrabold text-red-600 dark:text-red-400">"Question"</span>? <br /> This action is permanent and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deletingQuestion) {
                                    handleDeleteQuestion(deletingQuestion);
                                    setDeletingQuestion(null);
                                }
                            }}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Questions Dialog */}
            <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                            Delete Selected Questions
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                            You are about to purge <span className="font-extrabold text-red-600 dark:text-red-400">{selectedQuestions.length} selected question(s)</span> from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleBulkDeleteQuestions();
                                setIsBulkDeleteOpen(false);
                            }}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Category Delete Confirmation Alert Dialog */}
            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent className="sm:max-w-[420px] w-[92vw] rounded-xl">
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle className="text-center text-base sm:text-lg font-bold">
                            Delete Category
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-xs sm:text-sm pt-1">
                            Are you sure you want to delete <span className="font-extrabold text-red-600 dark:text-red-400">"{categoryToDelete?.name}"</span> Category? <br />This action is permanent and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (categoryToDelete) {
                                    handleDeleteCategory(categoryToDelete.id);
                                    setCategoryToDelete(null);
                                }
                            }}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </AppLayout>
    );
}

