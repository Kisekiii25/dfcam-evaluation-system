import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CircleAlert, GraduationCap, ArrowRight, Calendar, ArrowLeft, X, BookOpen } from 'lucide-react';

interface Subject {
    id: number;
    code?: string;
    name?: string;
    title?: string;
}

interface TeachingLoad {
    id: number;
    subject?: Subject; // Adjust field name if your relation is named differently
    section?: {
        name: string;
        year_level: string;
        course?: {
            name: string;
        };
    };
}

interface Teacher {
    id: number;
    name: string;
    employee_id: string;
    teaching_loads?: TeachingLoad[];
}

interface SelectTeacherProps {
    teachers: Teacher[];
    settings: {
        academic_year: string;
        semester: string;
    };
    evaluatedTeacherIds: number[];
}

export default function SelectTeacher({ teachers = [], settings, evaluatedTeacherIds = [] }: SelectTeacherProps) {
    const { flash } = usePage().props as any;
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccessModal(true);
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-[#0a1128] text-white font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center relative overflow-x-hidden">
            <Head title="Select Instructor" />

            <div className="w-full max-w-2xl space-y-5 my-auto py-4">

                {/* Back Navigation Trigger */}
                <div className="flex justify-start">
                    <Link href={route('dashboard')}>
                        <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 font-medium text-xs uppercase tracking-wider transition cursor-pointer bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/60">
                            <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
                        </button>
                    </Link>
                </div>

                {/* Header Context Banner */}
                <div className="bg-[#111a36] border border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5">
                        <h1 className="text-lg font-bold text-slate-100 tracking-wide">Faculty Evaluation Roster</h1>
                        <p className="text-xs text-slate-400 font-medium">Complete the assessment scales for your current instructors.</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-700/60 rounded-md bg-[#1d2d50] text-blue-400 text-[11px] font-semibold tracking-wide self-start sm:self-center">
                        <Calendar className="w-3.5 h-3.5 text-blue-400/70" />
                        <span>A.Y. {settings?.academic_year || '2027-2028'} • {settings?.semester || '1st Semester'}</span>
                    </div>
                </div>

                {/* Main List Section */}
                <div className="bg-[#111a36] border border-slate-800/80 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-800/80 bg-[#0d1636] flex justify-between items-center">
                        <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Your Assigned Instructors</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {evaluatedTeacherIds.length} / {teachers.length} Evaluated
                        </span>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                        {teachers.length > 0 ? (
                            teachers.map((teacher) => {
                                const hasEvaluated = evaluatedTeacherIds.includes(teacher.id);

                                // Extract subject names from teaching_loads
                                const assignedSubjects = teacher.teaching_loads
                                    ?.map((load) => {
                                        // Ensure load.subject is an object, not an integer ID
                                        if (load.subject && typeof load.subject === 'object') {
                                            return load.subject.name || load.subject.title || load.subject.code || load.subject.subject_code;
                                        }
                                        return null;
                                    })
                                    .filter(Boolean);

                                const subjectDisplay = assignedSubjects && assignedSubjects.length > 0
                                    ? assignedSubjects.join(', ')
                                    : 'No Subject Assigned';

                                return (
                                    <div key={teacher.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-blue-950/10 transition-colors">
                                        <div className="space-y-0.5 min-w-0">
                                            <h3 className={`font-semibold text-sm tracking-wide truncate ${hasEvaluated ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                {teacher.name}
                                            </h3>

                                            {/* Display Assigned Subject(s) here instead of Employee ID */}
                                            <p className="text-[11px] text-blue-400/80 font-medium flex items-center gap-1.5 truncate">
                                                <BookOpen className="w-3 h-3 text-blue-400/60 shrink-0" />
                                                <span className="truncate">{subjectDisplay}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center w-full sm:w-auto mt-1 sm:mt-0">
                                            {hasEvaluated ? (
                                                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-400 text-xs font-semibold tracking-wide bg-emerald-950/20 border border-emerald-900/30 w-full sm:w-auto">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Completed</span>
                                                </div>
                                            ) : (
                                                <Link href={route('evaluation.form', teacher.id)} className="w-full sm:w-auto">
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider gap-1.5 px-4 h-9 w-full sm:w-auto cursor-pointer shadow-sm active:scale-95 transition-all">
                                                        Evaluate <ArrowRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center p-6">
                                <GraduationCap className="w-10 h-10 text-blue-500/20 mb-2.5" />
                                <h3 className="text-xs font-bold text-slate-200 tracking-wide">No assigned instructors found</h3>
                                <p className="text-[11px] text-slate-400 opacity-80 max-w-xs mt-1 leading-relaxed">
                                    Your student mapping configuration doesn't list active class loads for this target term.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Anonymity Notification Banner */}
                <div className="p-3.5 rounded-xl border border-blue-900/30 bg-blue-500/5 text-slate-300 flex items-start gap-2.5">
                    <CircleAlert className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                    <div className="text-[11px] space-y-0.5 leading-relaxed">
                        <p className="font-bold text-blue-400 uppercase tracking-wider">Anonymous Feedback Rule:</p>
                        <p className="text-slate-400 font-medium">
                            Your submissions are scrubbed of structural user traits before saving. Instructors only receive aggregate final matrix scales.
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#111a36] border border-slate-700/60 max-w-md w-full rounded-2xl p-6 shadow-2xl relative text-center space-y-4 transform transition-all scale-100">

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-500/5">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white tracking-wide">Submission Complete!</h3>
                            <p className="text-xs text-slate-400 px-2 leading-relaxed">
                                {flash?.success || "Your evaluation response package has been securely recorded."}
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs h-10 rounded-xl cursor-pointer"
                            >
                                Continue Evaluations
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
