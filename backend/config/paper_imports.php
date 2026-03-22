<?php

return [
    'disk' => env('PAPER_IMPORTS_DISK', env('FILESYSTEM_DISK', 'local')),
    'queue' => env('PAPER_IMPORTS_QUEUE', 'imports'),
    'ai' => [
        'provider' => env('PAPER_IMPORTS_AI_PROVIDER', 'none'),
        'model' => env('PAPER_IMPORTS_AI_MODEL', env('AI_MARKING_MODEL', 'gpt-4.1-mini')),
    ],
];
