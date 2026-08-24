import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, ChevronLeft, User, GraduationCap, Calendar, AlertTriangle } from 'lucide-react';

interface Question {
    id: number;
    question_text: string;
    type: 'rating' | 'comment' | 'text';
}

interface Category {
    id: number;
    name: string;
    questions: Question[];
}

interface EvaluationFormProps {
    teacher: { id: number; name: string };
    categories: Category[];
    settings: { academic_year: string; semester: string };
    selection: { course: string; year: string; section: string };
}

export default function EvaluationForm({ teacher, categories = [], settings, selection }: EvaluationFormProps) {
    const [showValidationError, setShowValidationError] = useState(false);

    // Dynamic key unique to this teacher and section to avoid mixing up progress between different evaluations
    const storageKey = `evaluation_draft_${teacher?.id}_${selection?.course}_${selection?.year}_${selection?.section}`;

    // Helper to get initial ratings saved in localStorage (if any exist)
    const getSavedRatings = (): Record<number, number | string> => {
        if (typeof window === 'undefined') return {};
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Failed to load saved progress from localStorage:', e);
            return {};
        }
    };

    // 1. Initialize form with structural data and restored ratings
    const { data, setData, post, processing } = useForm({
        ratings: getSavedRatings(),
        course: selection?.course || '',
        year: selection?.year || '',
        section: selection?.section || '',
    });

    // 2. Persist ratings to localStorage whenever they change
    useEffect(() => {
        if (Object.keys(data.ratings).length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(data.ratings));
        }
    }, [data.ratings, storageKey]);

    // Safe Optional Chaining check to prevent crashing on empty dataset matrices
    const allQuestions = (categories || []).flatMap(category => category?.questions || []);
    const totalRequiredQuestions = allQuestions.length;
    const answeredCount = Object.keys(data.ratings || {}).filter(id => {
        const val = data.ratings[Number(id)];
        return val !== undefined && val !== '';
    }).length;

    const isFormIncomplete = answeredCount < totalRequiredQuestions;

    const handleRatingChange = (questionId: number, value: string) => {
        setData('ratings', { ...data.ratings, [questionId]: parseInt(value) });
    };

    const handleTextChange = (questionId: number, value: string) => {
        setData('ratings', { ...data.ratings, [questionId]: value });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isFormIncomplete) {
            setShowValidationError(true);

            // Find the first question that hasn't been answered
            const firstUnansweredQuestion = allQuestions.find((q) => {
                const val = data.ratings[q.id];
                return val === undefined || val === '';
            });

            if (firstUnansweredQuestion) {
                // Locate the element in the DOM
                const element = document.getElementById(`question-${firstUnansweredQuestion.id}`);
                if (element) {
                    // Scroll smoothly and center the question on the screen
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }

        setShowValidationError(false);
        post(route('evaluation.submit', { teacher: teacher.id }), {
            onSuccess: () => {
                // Clear saved draft from localStorage upon successful form submission
                localStorage.removeItem(storageKey);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#0a1128] text-slate-100 font-sans antialiased overflow-x-hidden">
            <Head title={`Evaluating ${teacher?.name || 'Instructor'}`} />

            <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">

                {/* Back Button */}
                <Link
                    href={route('evaluation.select')}
                    className="inline-flex items-center text-slate-400 hover:text-blue-400 mb-6 transition text-sm font-medium group"
                >
                    <ChevronLeft className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition" />
                    Change Instructor
                </Link>

                {/* Main Header Information Block */}
                <div className="mb-10 bg-gradient-to-br from-[#111a36] to-[#162246] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 space-y-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                <Calendar className="w-3 h-3" /> A.Y. {settings?.academic_year} • {settings?.semester}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-3">Instructor Evaluation</h1>
                        </div>

                        <div className="h-[1px] w-full bg-slate-800" />

                        <div className="flex flex-wrap gap-y-3 gap-x-6 pt-1">
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                                <User className="w-4 h-4 text-blue-500" />
                                <span>Evaluating: <strong className="text-white font-semibold">{teacher?.name}</strong></span>
                            </div>
                            <div className="hidden sm:block text-slate-800">|</div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                                <GraduationCap className="w-4 h-4 text-emerald-500" />
                                <span>Section: <strong className="text-white font-semibold">{selection?.course} {selection?.year} - {selection?.section}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questionnaire Form */}
                <form onSubmit={submit} className="space-y-12">
                    {(categories || []).map((category) => (
                        <div key={category.id} className="space-y-6">
                            <h2 className="text-xs sm:text-sm font-black flex items-center gap-3 text-blue-400 uppercase tracking-[0.2em] sticky top-16 bg-[#0a1128] py-3 z-40">
                                <div className="w-6 h-[2px] bg-blue-500 rounded-full" />
                                {category.name}
                            </h2>

                            <div className="grid grid-cols-1 gap-4 w-full">
                                {(category?.questions || []).map((question, idx) => {
                                    const isAnswered = data.ratings[question.id] !== undefined && data.ratings[question.id] !== '';
                                    return (
                                        <Card
                                            key={question.id}
                                            id={`question-${question.id}`}
                                            className={`bg-[#111a36] shadow-lg transition-all duration-200 overflow-hidden w-full border ${showValidationError && !isAnswered
                                                    ? 'border-rose-500/60 shadow-rose-950/20 bg-rose-950/5'
                                                    : 'border-slate-800/80 hover:border-slate-700/80'
                                                }`}
                                        >
                                            <CardContent className="p-5 sm:p-6 w-full">
                                                <div className="flex items-start gap-3 mb-6 w-full min-w-0">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded mt-0.5 min-w-[24px] text-center select-none shrink-0 ${showValidationError && !isAnswered
                                                            ? 'bg-rose-600 text-white'
                                                            : 'bg-slate-950 text-slate-400'
                                                        }`}>
                                                        {idx + 1}
                                                    </span>
                                                    <div className="min-w-0 w-full">
                                                        <p className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed whitespace-normal break-words tracking-normal">
                                                            {question.question_text}
                                                        </p>
                                                    </div>
                                                </div>

                                                {question.type === 'comment' || question.type === 'text' ? (
                                                    <textarea
                                                        value={data.ratings[question.id] as string || ''}
                                                        className="w-full min-h-[120px] p-4 rounded-xl border border-slate-700 bg-[#0a1128] text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 resize-y"
                                                        placeholder="Provide your specific feedback here..."
                                                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                                                    />
                                                ) : (
                                                    <RadioGroup
                                                        value={data.ratings[question.id]?.toString() || ''}
                                                        onValueChange={(val) => handleRatingChange(question.id, val)}
                                                        className="flex flex-wrap items-center gap-3"
                                                    >
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <div key={num} className="flex items-center">
                                                                <RadioGroupItem
                                                                    value={num.toString()}
                                                                    id={`q-${question.id}-${num}`}
                                                                    className="sr-only peer"
                                                                />
                                                                <Label
                                                                    htmlFor={`q-${question.id}-${num}`}
                                                                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-150 font-black text-sm select-none

                                                                    /* Unchecked Base & Hover State */
                                                                    border-slate-700/80 bg-slate-900/40 text-slate-400
                                                                    peer-data-[state=unchecked]:hover:border-slate-500
                                                                    peer-data-[state=unchecked]:hover:bg-slate-800/80
                                                                    peer-data-[state=unchecked]:hover:text-slate-200

                                                                    /* Checked & Hover-While-Checked State */
                                                                    peer-data-[state=checked]:bg-blue-600
                                                                    peer-data-[state=checked]:text-white
                                                                    peer-data-[state=checked]:border-blue-400
                                                                    peer-data-[state=checked]:shadow-[0_0_20px_rgba(37,99,235,0.45)]
                                                                    peer-data-[state=checked]:hover:bg-blue-500
                                                                    peer-data-[state=checked]:hover:border-blue-300"
                                                                >
                                                                    {num}
                                                                </Label>
                                                            </div>
                                                        ))}

                                                        <div className="ml-auto hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 select-none">
                                                            <span>Poor</span>
                                                            <div className="w-10 h-[1px] bg-slate-800" />
                                                            <span>Excellent</span>
                                                        </div>
                                                    </RadioGroup>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Progress tracker / Warning bar */}
                    <div className="bg-[#111a36] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-xs font-semibold bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                                Progress: <span className="text-blue-400 font-bold">{answeredCount}</span> / {totalRequiredQuestions} Questions Answered
                            </div>
                        </div>
                        {showValidationError && isFormIncomplete && (
                            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl animate-pulse">
                                <AlertTriangle className="w-4 h-4" /> Please answer all highlighted questions.
                            </div>
                        )}
                    </div>

                    {/* Submit Section Layout */}
                    <div className="pt-6 pb-24 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                            Please ensure all answers are objective and accurate prior to form final submission.
                        </p>
                        <Button
                            type="submit"
                            disabled={processing}
                            className={`w-full sm:w-auto px-12 text-white h-13 rounded-xl shadow-xl gap-2.5 font-bold uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${isFormIncomplete
                                    ? 'bg-slate-800 cursor-not-allowed text-slate-500 shadow-none border border-slate-700/50'
                                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/40'
                                }`}
                        >
                            {processing ? 'Processing...' : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    Submit Evaluation
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
