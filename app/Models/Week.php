<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Week extends Model
{
    use HasFactory;

    protected $guarded = [];

    // --- TAMBAHKAN RELASI INI ---
    public function course()
    {
        // Satu Minggu milik Satu Course
        return $this->belongsTo(Course::class);
    }
    // ----------------------------

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }
}
