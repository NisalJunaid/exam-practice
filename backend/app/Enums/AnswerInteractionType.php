<?php

namespace App\Enums;

enum AnswerInteractionType: string
{
    case ShortText = 'short_text';
    case LongText = 'long_text';
    case SelectSingle = 'select_single';
    case SelectMultiple = 'select_multiple';
    case MultiField = 'multi_field';
    case TableInput = 'table_input';
    case CalculationWithWorking = 'calculation_with_working';
    case CanvasDraw = 'canvas_draw';
    case GraphPlot = 'graph_plot';
    case ImageUpload = 'image_upload';
    case CanvasPlusText = 'canvas_plus_text';
    case DiagramAnnotation = 'diagram_annotation';
    case Matching = 'matching';
    case McqSingle = 'mcq_single';
    case McqMultiple = 'mcq_multiple';
    case Other = 'other';
}
