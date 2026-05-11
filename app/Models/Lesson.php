<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Relasi ke Week (Bapaknya)
    public function week()
    {
        return $this->belongsTo(Week::class);
    }

    // Relasi ke Module (Anaknya)
    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    // 👇 PERBAIKI BAGIAN INI 👇
    // Jangan pakai hasManyThrough(..., Module::class)
    // Kembalikan ke relasi langsung karena user_progress punya lesson_id
    public function user_progress()
    {
        return $this->hasMany(UserProgress::class);
    }
}
