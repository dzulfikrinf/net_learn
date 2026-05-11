<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $guarded = [];

    // --- INI YANG WAJIB ADA ---
    protected $casts = [
        'data' => 'array', // <--- KUNCI PERBAIKANNYA
    ];
    // --------------------------

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
