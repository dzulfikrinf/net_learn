<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');

            // 👇 TAMBAHKAN BARIS INI (Wajib ada biar gak error)
            $table->string('title')->nullable();

            // Tipe konten: 'text', 'game_matching', 'quiz', dll
            $table->string('type');

            // Isi materi (HTML atau JSON String untuk config game)
            // Kita pakai longText biar muat banyak
            $table->longText('content')->nullable();

            // Kolom 'data' boleh dibiarkan ada, boleh dihapus.
            // Di seeder baru, kita menyimpan config game masuk ke kolom 'content'
            // supaya lebih fleksibel (satu kolom untuk semua).
            $table->json('data')->nullable();

            $table->integer('order')->default(0); // Tambahkan default 0 biar aman
            $table->boolean('is_active')->default(true); // Tambahkan is_active biar sesuai seeder
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
