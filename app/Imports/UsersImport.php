<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Section;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToModel, WithHeadingRow
{
    /**
     * Tells Laravel Excel that column headings are on Row 6
     * (matching your custom export header layout).
     */
    public function headingRow(): int
    {
        return 6;
    }

    public function model(array $row): Model|array|null
    {
        // Skip rows without an email address
        if (empty($row['email'])) {
            return null;
        }

        $sectionId = $this->findSectionId($row['section'] ?? null);

        // Find existing users, including soft-deleted ones
        $existingUser = User::withTrashed()->where('email', $row['email'])->first();

        if ($existingUser) {
            // Restore if previously soft-deleted (preserves evaluation records!)
            if ($existingUser->trashed()) {
                $existingUser->restore();
            }

            // Re-assign section_id if resolved
            if ($sectionId) {
                $existingUser->update(['section_id' => $sectionId]);
            }

            return null;
        }

        // Create new user if they don't exist
        return new User([
            'name'                 => $row['name'],
            'email'                => $row['email'],
            'role'                 => $row['role'] ?? 'student',
            'section_id'           => $sectionId,
            'password'             => Hash::make($row['password'] ?? 'password123'),
            'must_change_password' => true, // Flag new imports for mandatory password update
        ]);
    }

    /**
     * Matches the exported section string (e.g. "BS Information Systems 1 - 1")
     * back to the corresponding Section model ID.
     */
    private function findSectionId(?string $sectionString): ?int
    {
        if (empty($sectionString) || $sectionString === 'N/A') {
            return null;
        }

        $sections = Section::with('course')->get();

        foreach ($sections as $section) {
            $courseName = $section->course?->name ?? '';
            $formatted = "{$courseName} {$section->year_level} - {$section->name}";

            if (trim($formatted) === trim($sectionString) || trim($section->name) === trim($sectionString)) {
                return $section->id;
            }
        }

        return null;
    }
}
