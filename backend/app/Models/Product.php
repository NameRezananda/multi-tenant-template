<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name', 'price'])]
class Product extends Model
{
    use BelongsToTenant;
}
