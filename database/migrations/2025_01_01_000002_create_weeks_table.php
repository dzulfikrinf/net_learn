<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Gunakan Schema::create (BUKAN Schema::table)
        Schema::create('weeks', function (Blueprint $table) {
            $table->id();

            // DISINI KITA DEFINISIKAN HUBUNGANNYA
            $table->foreignId('course_id')
                  ->constrained('courses') // Menunjuk ke tabel courses yang sudah dibuat duluan
                  ->onDelete('cascade');

            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->integer('week_number');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weeks');
    }
};
