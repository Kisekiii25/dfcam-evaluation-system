<?php

namespace App\Exports;

use App\Models\Category;
use App\Models\EvaluationResult;
use App\Models\EvaluationSetting;
use App\Models\Question;
use App\Models\Teacher;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\BaseDrawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class TeacherResultsExport implements FromCollection, ShouldAutoSize, WithCustomStartCell, WithDrawings, WithEvents, WithHeadings, WithMapping
{
    protected string $academicYear;

    protected string $semester;

    protected Collection $ratingCategories;

    protected Collection $commentQuestions;

    public function __construct(?string $academicYear = null, ?string $semester = null)
    {
        $activeSetting = EvaluationSetting::find(1) ?? EvaluationSetting::where('is_active', true)->first();
        $this->academicYear = $academicYear ?? $activeSetting?->academic_year ?? '2025-2026';
        $this->semester = $semester ?? $activeSetting?->semester ?? '1st';

        // 1. Only load categories that have numerical 'rating' questions
        $this->ratingCategories = Category::whereHas('questions', function ($q) {
            $q->where('type', 'rating');
        })->orderBy('order', 'asc')->get();

        // 2. Load all comment questions
        $this->commentQuestions = Question::where('type', 'comment')
            ->orderBy('order', 'asc')
            ->get();
    }

    public function collection(): Collection
    {
        return Teacher::orderBy('name', 'asc')->get();
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function headings(): array
    {
        $headings = [
            'Employee ID',
            'Teacher Name',
            'Status',
        ];

        foreach ($this->ratingCategories as $category) {
            $headings[] = $category->name;
        }

        $headings[] = 'Overall Average Rating';

        foreach ($this->commentQuestions as $question) {
            $headings[] = $question->question_text;
        }

        return $headings;
    }

    public function map($teacher): array
    {
        $academicYear = $this->academicYear;
        $semester = $this->semester;

        $row = [
            $teacher->employee_id,
            $teacher->name,
            $teacher->is_active ? 'Active' : 'Inactive',
        ];

        // 1. Average Rating per category
        foreach ($this->ratingCategories as $category) {
            $catAvg = EvaluationResult::join('questions', 'questions.id', '=', 'evaluation_results.question_id')
                ->where('questions.category_id', $category->id)
                ->where('evaluation_results.teacher_id', $teacher->id)
                ->where('evaluation_results.academic_year', $academicYear)
                ->where('evaluation_results.semester', $semester)
                ->where('questions.type', 'rating')
                ->avg('evaluation_results.answer');

            $row[] = $catAvg ? number_format($catAvg, 2).' / 5' : 'N/A';
        }

        // 2. Overall Average Rating + Guidance Descriptive Text
        $overallAvg = EvaluationResult::join('questions', 'questions.id', '=', 'evaluation_results.question_id')
            ->where('evaluation_results.teacher_id', $teacher->id)
            ->where('evaluation_results.academic_year', $academicYear)
            ->where('evaluation_results.semester', $semester)
            ->where('questions.type', 'rating')
            ->avg('evaluation_results.answer');

        $ratingInfo = $this->getRatingBadge($overallAvg ? (float) $overallAvg : null);
        $row[] = $ratingInfo['label'];

        // 3. Comment Questions
        foreach ($this->commentQuestions as $question) {
            $answers = EvaluationResult::where('question_id', $question->id)
                ->where('teacher_id', $teacher->id)
                ->where('academic_year', $academicYear)
                ->where('semester', $semester)
                ->whereNotNull('answer')
                ->where('answer', '!=', '')
                ->pluck('answer')
                ->map(fn ($item) => trim($item))
                ->implode("\n• ");

            $row[] = $answers ? '• '.$answers : 'No comments recorded';
        }

        return $row;
    }

    // Helper method to map guidance rubric ratings to labels and soft hex colors
    private function getRatingBadge(?float $score): array
    {
        if ($score === null) {
            return [
                'label' => 'N/A',
                'bg' => 'F2F2F2',
                'font' => '595959',
            ];
        }

        if ($score >= 4.75) {
            return [
                'label' => number_format($score, 2).' - Outstanding',
                'bg' => 'C6EFCE', // Soft Dark Green Fill
                'font' => '006100',  // Dark Green Text
            ];
        } elseif ($score >= 3.50) {
            return [
                'label' => number_format($score, 2).' - Very Satisfied',
                'bg' => 'E2EFDA', // Soft Light Green Fill
                'font' => '375623',  // Forest Green Text
            ];
        } elseif ($score >= 2.50) {
            return [
                'label' => number_format($score, 2).' - Moderately Satisfied',
                'bg' => 'FFEB9C', // Soft Yellow Fill
                'font' => '9C6500',  // Dark Gold Text
            ];
        } elseif ($score >= 1.50) {
            return [
                'label' => number_format($score, 2).' - Slightly Satisfied',
                'bg' => 'FCE4D6', // Soft Orange Fill
                'font' => 'C65911',  // Dark Orange Text
            ];
        } else {
            return [
                'label' => number_format($score, 2).' - Not Satisfied',
                'bg' => 'FFC7CE', // Soft Red Fill
                'font' => '9C0006',  // Dark Red Text
            ];
        }
    }

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
            $drawing->setOffsetX(-20);
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

                $teachers = $this->collection();
                $totalColumns = count($this->headings());
                $lastColumn = Coordinate::stringFromColumnIndex($totalColumns);
                $highestRow = $sheet->getHighestRow();

                $semText = str_contains(strtolower($this->semester), 'semester')
                    ? $this->semester
                    : "{$this->semester} Semester";

                // 1. Title Header Formatting
                $sheet->mergeCells("B2:{$lastColumn}2");
                $sheet->setCellValue('B2', 'DR. FILEMON C. AGUILAR MEMORIAL COLLEGE OF LAS PIÑAS');
                $sheet->getStyle('B2')->getFont()->setBold(true)->setSize(13);
                $sheet->getStyle('B2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->mergeCells("B3:{$lastColumn}3");
                $sheet->setCellValue('B3', 'TEACHER EVALUATION RESULTS REPORT');
                $sheet->getStyle('B3')->getFont()->setBold(true)->setSize(11);
                $sheet->getStyle('B3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->mergeCells("B4:{$lastColumn}4");
                $sheet->setCellValue('B4', "{$semText}, A.Y. {$this->academicYear}");
                $sheet->getStyle('B4')->getFont()->setSize(10)->setItalic(true);
                $sheet->getStyle('B4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // 2. Table Header Row Formatting (Row 6)
                $headerRange = "A6:{$lastColumn}6";
                $sheet->getStyle($headerRange)->getFont()->setBold(true)->getColor()->setARGB('FFFFFF');
                $sheet->getStyle($headerRange)->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('1034A6'); // Dark Navy Blue

                $sheet->getStyle($headerRange)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 3. Data Alignment and Text Wrapping
                if ($highestRow >= 7) {
                    $dataRange = "A7:{$lastColumn}{$highestRow}";

                    $sheet->getStyle($dataRange)->getAlignment()
                        ->setWrapText(true)
                        ->setVertical(Alignment::VERTICAL_TOP);

                    $sheet->getStyle("A7:A{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("C7:C{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    // 4. Highlight Overall Average Rating Cells based on Guidance Scale
                    $overallColIndex = 3 + count($this->ratingCategories) + 1; // Col A, B, C + rating categories
                    $overallColLetter = Coordinate::stringFromColumnIndex($overallColIndex);

                    foreach ($teachers as $index => $teacher) {
                        $currentRow = 7 + $index;

                        $overallAvg = EvaluationResult::join('questions', 'questions.id', '=', 'evaluation_results.question_id')
                            ->where('evaluation_results.teacher_id', $teacher->id)
                            ->where('evaluation_results.academic_year', $this->academicYear)
                            ->where('evaluation_results.semester', $this->semester)
                            ->where('questions.type', 'rating')
                            ->avg('evaluation_results.answer');

                        $badge = $this->getRatingBadge($overallAvg ? (float) $overallAvg : null);
                        $cellCoordinate = "{$overallColLetter}{$currentRow}";

                        // Fill Cell Background Color
                        $sheet->getStyle($cellCoordinate)->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()->setARGB($badge['bg']);

                        // Text Color & Alignment
                        $sheet->getStyle($cellCoordinate)->getFont()
                            ->setBold(true)
                            ->getColor()->setARGB($badge['font']);

                        $sheet->getStyle($cellCoordinate)->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                }

                // 5. Set readable fixed width for comment columns
                $firstCommentColIndex = 3 + count($this->ratingCategories) + 2;
                for ($i = $firstCommentColIndex; $i <= $totalColumns; $i++) {
                    $colLetter = Coordinate::stringFromColumnIndex($i);
                    $sheet->getColumnDimension($colLetter)->setAutoSize(false);
                    $sheet->getColumnDimension($colLetter)->setWidth(50);
                }
            },
        ];
    }
}
