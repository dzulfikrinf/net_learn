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
        // 1. Tambah kolom 'duration' di tabel user_progress
        Schema::table('user_progress', function (Blueprint $table) {
            // Mengecek agar tidak error jika kolom sudah ada
            if (!Schema::hasColumn('user_progress', 'duration')) {
                $table->integer('duration')->default(0)->after('attempts');
            }
        });

        // 2. Tambah kolom 'last_lesson_completed_date' di tabel users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'last_lesson_completed_date')) {
                $table->date('last_lesson_completed_date')->nullable()->after('xp');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            if (Schema::hasColumn('user_progress', 'duration')) {
                $table->dropColumn('duration');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'last_lesson_completed_date')) {
                $table->dropColumn('last_lesson_completed_date');
            }
        });
    }
};
