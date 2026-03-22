<?php

namespace App\Enums;

enum PaperSourceFileRole: string
{
    case QuestionPaper = 'question_paper';
    case MarkScheme = 'mark_scheme';
    case Supplementary = 'supplementary';
}
