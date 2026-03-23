<?php

namespace App\Enums;

enum QuestionVisualAssetRole: string
{
    case Reference = 'reference';
    case Diagram = 'diagram';
    case Table = 'table';
    case Graph = 'graph';
    case Structure = 'structure';
    case Other = 'other';
}
