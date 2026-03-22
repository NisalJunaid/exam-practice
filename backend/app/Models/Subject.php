<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_board_id',
        'exam_level_id',
        'name',
        'slug',
        'code',
    ];

    public function examBoard(): BelongsTo
    {
        return $this->belongsTo(ExamBoard::class);
    }

    public function examLevel(): BelongsTo
    {
        return $this->belongsTo(ExamLevel::class);
    }

    public function papers(): HasMany
    {
        return $this->hasMany(Paper::class);
    }
}
