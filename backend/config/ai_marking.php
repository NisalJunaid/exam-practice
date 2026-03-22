<?php

return [
    'provider' => env('AI_MARKING_PROVIDER', 'fake'),
    'model' => env('AI_MARKING_MODEL', 'deterministic-reviewer'),
    'queue' => env('AI_MARKING_QUEUE', 'ai-marking'),
    'max_output_retries' => (int) env('AI_MARKING_MAX_OUTPUT_RETRIES', 2),
    'openai' => [
        'api_key' => env('OPENAI_API_KEY', ''),
        'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        'timeout' => (int) env('OPENAI_TIMEOUT', 30),
    ],
];
