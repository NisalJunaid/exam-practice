<?php

namespace App\Enums;

enum AiMarkingLogStatus: string
{
    case Success = 'success';
    case Failed = 'failed';
    case InvalidOutput = 'invalid_output';
}
