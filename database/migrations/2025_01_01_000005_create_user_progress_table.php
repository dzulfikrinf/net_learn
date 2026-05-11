<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->foreignId('lesson_id')->constrained('modules')->onDelete('cascade');

            // Status: 'locked' (terkunci), 'unlocked' (terbuka), 'completed' (selesai)
            // (Opsional: tambahkan default false untuk is_completed jika logika controller kamu pakai boolean)
            $table->string('status')->default('locked');
            $table->boolean('is_completed')->default(false); // Tambahan biar aman dengan controller lama

            // Data untuk Analisis Skripsi
            $table->integer('score')->default(0);
            $table->integer('attempts')->default(0);
            $table->integer('time_spent')->default(0);

            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};
