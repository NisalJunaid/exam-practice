<?php

namespace App\Enums;

enum ImportMatchStatus: string
{
    case Ready = 'ready';
    case NeedsReview = 'needs_review';
    case MissingVisual = 'missing_visual';
    case Warning = 'warning';
}
