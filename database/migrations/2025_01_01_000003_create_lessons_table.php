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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            // Relasi ke tabel weeks
            $table->foreignId('week_id')->constrained()->onDelete('cascade');

            $table->string('title'); // Judul Level (misal: "Mengenal IP Address")
            $table->string('slug'); // Untuk URL cantik
            $table->integer('order')->default(0); // Urutan level: 1, 2, 3...
            $table->integer('xp_reward')->default(100); // Hadiah XP jika lulus
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
