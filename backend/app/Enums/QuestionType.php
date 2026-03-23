<?php

namespace App\Enums;

enum QuestionType: string
{
    case ShortAnswer = 'short_answer';
    case Structured = 'structured';
    case Table = 'table';
    case DiagramLabel = 'diagram_label';
    case Calculation = 'calculation';
    case MultiplePart = 'multiple_part';
    case Essay = 'essay';
    case Other = 'other';
}
