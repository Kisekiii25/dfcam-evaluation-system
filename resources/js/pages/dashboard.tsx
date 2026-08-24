import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Users, GraduationCap, Layers, CheckCircle2, Award, ChevronDown, X, Search, Check, AlertCircle, Eye } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

interface StudentItem {
    id: number;
    name: string;
    email: string;
    has_participated: boolean;
}

interface SectionProgressItem {
    course: string;
    year: string;
    section: string;
    students_participated: number;
    total_students: number;
    students: StudentItem[];
}

interface TermOption {
    academic_year: string;
    semester: string;
}

interface DashboardProps {
    stats: {
        total_students: number;
        active_teachers: number;
        deactivated_teachers: number;
        total_sections: number;
        total_completed_evals: number;
    };
    sectionProgress: SectionProgressItem[];
    settings?: {
        academic_year: string;
        semester: string;
    };
    availableTerms: TermOption[];
    currentFilters: {
        academic_year: string;
        semester: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    stats,
    sectionProgress = [],
    settings,
    availableTerms = [],
    currentFilters
}: DashboardProps) {

    // Modal & Filter States
    const [selectedSection, setSelectedSection] = useState<SectionProgressItem | null>(null);
    const [filterTab, setFilterTab] = useState<'all' | 'participated' | 'pending'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleTermChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;

        if (!val) {
            router.get(route('dashboard'));
            return;
        }

        const [ay, sem] = val.split('|');
        router.get(route('dashboard'), {
            academic_year: ay,
            semester: sem
        }, {
            preserveState: true,
            replace: true
        });
    };

    const activeFilterString = `${currentFilters.academic_year}|${currentFilters.semester}`;

    // Filter students inside modal by search query and participation status
    const filteredStudents = selectedSection?.students.filter((student) => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterTab === 'participated') return matchesSearch && student.has_participated;
        if (filterTab === 'pending') return matchesSearch && !student.has_participated;
        return matchesSearch;
    }) ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* Academic Setting Banner */}
                {settings && (
                    <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-500">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Active Term Context</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Displaying metrics for: <span className="text-indigo-400 font-semibold">A.Y. {currentFilters.academic_year} ({currentFilters.semester})</span>
                                </p>
                            </div>
                        </div>

                        <div className="relative inline-block w-full sm:w-72">
                            <select
                                value={activeFilterString}
                                onChange={handleTermChange}
                                className="cursor-pointer w-full appearance-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 shadow-md transition-all outline-none focus:border-blue-500/50 pr-10"
                            >
                                <option value={`${settings.academic_year}|${settings.semester}`}>
                                    Current (A.Y. {settings.academic_year} • {settings.semester})
                                </option>

                                {availableTerms
                                    .filter(term => !(term.academic_year === settings.academic_year && term.semester === settings.semester))
                                    .map((term, idx) => (
                                        <option
                                            key={idx}
                                            value={`${term.academic_year}|${term.semester}`}
                                        >
                                            A.Y. {term.academic_year} • {term.semester}
                                        </option>
                                    ))
                                }
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-[#111a36]/40 dark:bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Students</p>
                            <h3 className="text-2xl font-black text-white">{stats?.total_students ?? 0}</h3>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl text-blue-400">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-[#111a36]/40 dark:bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Faculty</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-black text-white">{stats?.active_teachers ?? 0}</h3>
                                {stats?.deactivated_teachers > 0 && (
                                    <span className="text-[11px] font-medium text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        {stats.deactivated_teachers} inactive
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-400">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-[#111a36]/40 dark:bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sections</p>
                            <h3 className="text-2xl font-black text-white">{stats?.total_sections ?? 0}</h3>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-amber-400">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-[#111a36]/40 dark:bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Participated</p>
                            <h3 className="text-2xl font-black text-white">{stats?.total_completed_evals ?? 0}</h3>
                        </div>
                        <div className="bg-violet-500/10 border border-violet-500/20 p-3.5 rounded-xl text-violet-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Section Submission Progress Table */}
                <div className="bg-[#111a36]/20 dark:bg-slate-900/15 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1">
                    <div className="p-5 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white tracking-wide">Faculty Evaluation Progress Tracker</h3>
                            <p className="text-xs text-slate-400 mt-1">Click any section row below to view student participation status.</p>
                        </div>
                    </div>

                    <div className="p-4 flex-1 overflow-x-auto">
                        {sectionProgress.length === 0 ? (
                            <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-6 text-center">
                                <p className="text-sm text-slate-500">No evaluation records found for this academic term.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                        <th className="pb-3 pl-2">Course / Program</th>
                                        <th className="pb-3">Year Level</th>
                                        <th className="pb-3">Section</th>
                                        <th className="pb-3 text-center">Total Students</th>
                                        <th className="pb-3 text-right pr-2">Participation & Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 text-sm">
                                    {sectionProgress.map((item, index) => {
                                        const total = item.total_students ?? 0;
                                        const participated = item.students_participated ?? 0;
                                        const percentage = total > 0 ? Math.min(100, Math.round((participated / total) * 100)) : 0;

                                        return (
                                            <tr
                                                key={index}
                                                onClick={() => {
                                                    setSelectedSection(item);
                                                    setFilterTab('all');
                                                    setSearchQuery('');
                                                }}
                                                className="hover:bg-blue-600/10 cursor-pointer transition-all duration-150 group"
                                            >
                                                <td className="py-4 pl-2 font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                    <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                                                    {item.course}
                                                </td>
                                                <td className="py-4 text-slate-300 font-medium">Year {item.year}</td>
                                                <td className="py-4">
                                                    <span className="bg-slate-950 px-2 py-1 rounded text-xs border border-slate-800 font-semibold text-slate-400 group-hover:border-blue-500/40">
                                                        Section {item.section}
                                                    </span>
                                                </td>

                                                <td className="py-4 text-center font-bold text-slate-200">
                                                    {total} Students
                                                </td>

                                                <td className="py-4 text-right pr-2">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-emerald-400">
                                                                {participated} Participated
                                                            </span>
                                                            {total > 0 && (
                                                                <span className="text-xs font-extrabold text-slate-400">
                                                                    ({percentage}%)
                                                                </span>
                                                            )}
                                                        </div>

                                                        {total > 0 && (
                                                            <div className="w-32 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${percentage >= 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                                        percentage >= 50 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                                                            'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                                                        }`}
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>

            {/* Student Participation Details Modal */}
            {selectedSection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                                        {selectedSection.course}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">
                                        Year {selectedSection.year} • Section {selectedSection.section}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mt-1">Student Evaluation Roster</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Active Term: <span className="text-indigo-400 font-semibold">{currentFilters.academic_year} ({currentFilters.semester})</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedSection(null)}
                                className="cursor-pointer p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Navigation & Search */}
                        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                                <button
                                    onClick={() => setFilterTab('all')}
                                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    All ({selectedSection.students.length})
                                </button>
                                <button
                                    onClick={() => setFilterTab('participated')}
                                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterTab === 'participated' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Participated ({selectedSection.students.filter(s => s.has_participated).length})
                                </button>
                                <button
                                    onClick={() => setFilterTab('pending')}
                                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterTab === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Pending ({selectedSection.students.filter(s => !s.has_participated).length})
                                </button>
                            </div>

                            <div className="relative w-full sm:w-60">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Student Roster List */}
                        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-800/50">
                            {filteredStudents.length === 0 ? (
                                <div className="py-12 text-center text-slate-500 text-xs">
                                    No students found matching the selected filter or query.
                                </div>
                            ) : (
                                filteredStudents.map((student) => (
                                    <div key={student.id} className="py-3 flex items-center justify-between hover:bg-slate-800/20 px-2 rounded-lg transition-colors">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-100">{student.name}</p>
                                            <p className="text-xs text-slate-400">{student.email}</p>
                                        </div>

                                        {student.has_participated ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <Check className="w-3.5 h-3.5" />
                                                Participated
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
                            <button
                                onClick={() => setSelectedSection(null)}
                                className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AppLayout>
    );
}
