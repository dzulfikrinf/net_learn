<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'xp',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // ==========================================
    // 1. TAMBAHKAN INI AGAR RANK SELALU TERBAWA
    // ==========================================
    /**
     * Atribut tambahan yang akan otomatis dilampirkan ke JSON model.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'rank',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ==========================================
    // 2. FUNGSI RUMUS RANK (OTOMATIS DIHITUNG)
    // ==========================================
    /**
     * Accessor untuk menghitung Pangkat (Rank) otomatis berdasarkan total XP.
     */
    public function getRankAttribute()
    {
        // Ambil nilai XP user (kalau null atau kosong, anggap 0)
        $xp = $this->xp ?? 0;

        if ($xp >= 12000) return 'IP Grandmaster';
        if ($xp >= 9000)  return 'Network Architect';
        if ($xp >= 5000)  return 'CIDR Specialist';
        if ($xp >= 2000)  return 'Subnet Mapper';
        if ($xp >= 500)   return 'Ping Tester';

        return 'DHCP Client'; // Rank paling dasar
    }

    // --- RELASI PROGRESS (Kode aslimu) ---
    public function progress()
    {
        // Hubungan: Satu User punya BANYAK Progress (UserProgress)
        return $this->hasMany(UserProgress::class);
    }
}
