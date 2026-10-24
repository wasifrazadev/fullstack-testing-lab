<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    protected $table = 'todos';

    protected $fillable = [
        'title',
        'description',
        'completed',
    ];

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
        ];
    }
}
