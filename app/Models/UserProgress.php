<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;

    // Mengizinkan semua kolom diisi (Mass Assignment)
    protected $guarded = [];

    // --- TAMBAHKAN FUNGSI RELASI INI ---
    public function lesson()
    {
        // Satu data Progress "Milik" Satu Lesson
        return $this->belongsTo(Lesson::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
