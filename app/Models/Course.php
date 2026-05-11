<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $guarded = [];

    public function weeks() {
        return $this->hasMany(Week::class);
    }

    // Relasi tembus ke Lesson lewat Week (HasManyThrough)
    public function lessons() {
        return $this->hasManyThrough(Lesson::class, Week::class);
    }
}
