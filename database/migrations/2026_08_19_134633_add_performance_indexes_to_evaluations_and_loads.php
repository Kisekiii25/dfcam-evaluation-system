<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_results', function (Blueprint $table) {
            // Added short custom name 'eval_res_user_ay_sem_teach_idx'
            $table->index(
                ['user_id', 'academic_year', 'semester', 'teacher_id'],
                'eval_res_user_ay_sem_teach_idx'
            );
        });

        Schema::table('teaching_loads', function (Blueprint $table) {
            // Added short custom name 'teach_load_sec_ay_sem_teach_idx'
            $table->index(
                ['section_id', 'academic_year', 'semester', 'teacher_id'],
                'teach_load_sec_ay_sem_teach_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_results', function (Blueprint $table) {
            $table->dropIndex('eval_res_user_ay_sem_teach_idx');
        });

        Schema::table('teaching_loads', function (Blueprint $table) {
            $table->dropIndex('teach_load_sec_ay_sem_teach_idx');
        });
    }
};
