<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('evaluation_results', function (Blueprint $table) {
            //
            $table->string('selected_course')->after('answer');
            $table->string('selected_year')->after('selected_course');
            $table->string('selected_section')->after('selected_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_results', function (Blueprint $table) {
            //
            $table->dropColumn(['selected_course', 'selected_year', 'selected_section']);
        });
    }
};
