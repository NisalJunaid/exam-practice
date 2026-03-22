<?php

namespace App\Enums;

enum ImportMatchStatus: string
{
    case Matched = 'matched';
    case PaperOnly = 'paper_only';
    case SchemeOnly = 'scheme_only';
    case Ambiguous = 'ambiguous';
    case Resolved = 'resolved';
}
