<?php

namespace App\Enums;

enum PaperAttemptStatus: string
{
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case Marking = 'marking';
    case Completed = 'completed';
    case Failed = 'failed';
}
