<?php

namespace App\Exports;

use App\Models\EvaluationSetting;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\BaseDrawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class UsersExport implements FromCollection, ShouldAutoSize, WithCustomStartCell, WithDrawings, WithEvents, WithHeadings, WithMapping
{
    protected string $academicYear;

    protected string $semester;

    public function __construct(?string $academicYear = null, ?string $semester = null)
    {
        $activeSetting = EvaluationSetting::find(1) ?? EvaluationSetting::where('is_active', true)->first();
        $this->academicYear = $academicYear ?? $activeSetting?->academic_year ?? '2025-2026';
        $this->semester = $semester ?? $activeSetting?->semester ?? '1st';
    }

    public function collection(): Collection
    {
        $isFirstSem = str_contains((string) $this->semester, '1');

        // Subquery 1: Completed evaluations (PostgreSQL Safe)
        $completedSubquery = DB::table('evaluation_results')
            ->join('teachers', 'teachers.id', '=', 'evaluation_results.teacher_id')
            ->where('teachers.is_active', true)
            ->selectRaw('COUNT(DISTINCT evaluation_results.teacher_id)')
            ->whereColumn('evaluation_results.user_id', 'users.id')
            ->where('evaluation_results.academic_year', $this->academicYear)
            ->where(function ($q) use ($isFirstSem) {
                if ($isFirstSem) {
                    $q->whereIn('evaluation_results.semester', [1, '1'])
                      ->orWhereRaw("CAST(evaluation_results.semester AS TEXT) IN ('1st', '1st Semester')");
                } else {
                    $q->whereIn('evaluation_results.semester', [2, '2'])
                      ->orWhereRaw("CAST(evaluation_results.semester AS TEXT) IN ('2nd', '2nd Semester')");
                }
            });

        // Subquery 2: Assigned teaching loads (PostgreSQL Safe)
        $assignedSubquery = DB::table('teaching_loads')
            ->join('teachers', 'teachers.id', '=', 'teaching_loads.teacher_id')
            ->where('teachers.is_active', true)
            ->selectRaw('COUNT(DISTINCT teaching_loads.teacher_id)')
            ->whereColumn('teaching_loads.section_id', 'users.section_id')
            ->where('teaching_loads.academic_year', $this->academicYear)
            ->where(function ($q) use ($isFirstSem) {
                if ($isFirstSem) {
                    $q->whereIn('teaching_loads.semester', [1, '1'])
                      ->orWhereRaw("CAST(teaching_loads.semester AS TEXT) IN ('1st', '1st Semester')");
                } else {
                    $q->whereIn('teaching_loads.semester', [2, '2'])
                      ->orWhereRaw("CAST(teaching_loads.semester AS TEXT) IN ('2nd', '2nd Semester')");
                }
            });

        return User::query()
            ->select('users.*')
            ->where('role', 'student')
            ->whereNull('users.deleted_at')
            ->with(['section.course'])
            ->selectSub($completedSubquery, 'evaluations_completed_count')
            ->selectSub($assignedSubquery, 'total_teachers_to_evaluate_count')
            ->get();
    }

    // Table headers start at Row 6
    public function startCell(): string
    {
        return 'A6';
    }

    public function headings(): array
    {
        return [
            'Name',
            'Email',
            'Role',
            'Section',
            'Evaluations Completed',
            'Total Teachers to Evaluate',
            'Status',
        ];
    }

    public function map($user): array
    {
        $formattedSection = null;
        if ($user->section) {
            $courseName = $user->section->course?->name ?? 'Course';
            $formattedSection = "{$courseName} {$user->section->year_level} - {$user->section->name}";
        }

        $completed = (int) ($user->evaluations_completed_count ?? 0);
        $total = (int) ($user->total_teachers_to_evaluate_count ?? 0);

        $status = 'Pending';
        if ($total > 0 && $completed >= $total) {
            $status = 'Completed';
        }

        return [
            $user->name,
            $user->email,
            $user->role,
            $formattedSection ?? 'N/A',
            $completed,
            $total,
            $status,
        ];
    }

    // Position logo on the left side (Column B area)
    public function drawings(): BaseDrawing|array
    {
        $drawing = new Drawing;
        $drawing->setName('School Logo');
        $drawing->setDescription('DFCAMCLP Logo');

        $logoPath = public_path('DFCAM-logo.webp');
        if (file_exists($logoPath)) {
            $drawing->setPath($logoPath);
            $drawing->setHeight(80);
            $drawing->setCoordinates('B1');
            $drawing->setOffsetX(-20); // Centers logo in the B1-B4 area
            $drawing->setOffsetY(5);

            return $drawing;
        }

        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $semText = str_contains(strtolower($this->semester), 'semester')
                    ? $this->semester
                    : "{$this->semester} Semester";

                // 1. School Name (Row 2, Centered across B2:G2)
                $sheet->mergeCells('B2:G2');
                $sheet->setCellValue('B2', 'DR. FILEMON C. AGUILAR MEMORIAL COLLEGE OF LAS PIÑAS');
                $sheet->getStyle('B2')->getFont()->setBold(true)->setSize(13);
                $sheet->getStyle('B2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // 2. Main Title (Row 3, Centered across B3:G3)
                $sheet->mergeCells('B3:G3');
                $sheet->setCellValue('B3', 'STUDENT EVALUATION PROGRESS REPORT');
                $sheet->getStyle('B3')->getFont()->setBold(true)->setSize(11);
                $sheet->getStyle('B3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // 3. Academic Term (Row 4, Centered across B4:G4)
                $sheet->mergeCells('B4:G4');
                $sheet->setCellValue('B4', "{$semText}, A.Y. {$this->academicYear}");
                $sheet->getStyle('B4')->getFont()->setSize(10)->setItalic(true);
                $sheet->getStyle('B4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // 4. Style Table Headers (Row 6)
                $headerRange = 'A6:G6';
                $sheet->getStyle($headerRange)->getFont()->setBold(true)->getColor()->setARGB('FFFFFF');
                $sheet->getStyle($headerRange)->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('1034A6'); // Dark Blue Navy Header

                $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            },
        ];
    }
}
