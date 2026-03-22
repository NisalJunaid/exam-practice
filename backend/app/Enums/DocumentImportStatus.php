<?php

namespace App\Enums;

enum DocumentImportStatus: string
{
    case Uploaded = 'uploaded';
    case Processing = 'processing';
    case NeedsReview = 'needs_review';
    case Approved = 'approved';
    case Failed = 'failed';
}
