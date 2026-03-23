<?php

namespace App\Support\AnswerInteractions;

use App\Enums\AnswerInteractionType;
use App\Enums\QuestionType;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class AnswerInteractionSchema
{
    public function normalize(?string $questionType, ?string $answerInteractionType, mixed $interactionConfig, bool $requiresVisualReference, string $errorPrefix = 'answer_interaction_type'): array
    {
        $resolvedType = $answerInteractionType ?: $this->defaultTypeForQuestion($questionType, $requiresVisualReference);

        if (! in_array($resolvedType, array_column(AnswerInteractionType::cases(), 'value'), true)) {
            throw ValidationException::withMessages([
                $errorPrefix => 'Unsupported answer_interaction_type value.',
            ]);
        }

        $config = is_array($interactionConfig) ? $interactionConfig : null;
        $config ??= $this->defaultConfig($resolvedType, $requiresVisualReference);

        $this->assertValidConfig($resolvedType, $config, $errorPrefix === 'answer_interaction_type' ? 'interaction_config' : preg_replace('/answer_interaction_type$/', 'interaction_config', $errorPrefix));

        return [
            'answer_interaction_type' => $resolvedType,
            'interaction_config' => $config,
        ];
    }

    public function defaultTypeForQuestion(?string $questionType, bool $requiresVisualReference = false): string
    {
        return match ($questionType) {
            QuestionType::ShortAnswer->value => AnswerInteractionType::ShortText->value,
            QuestionType::Structured->value => AnswerInteractionType::LongText->value,
            QuestionType::Table->value => AnswerInteractionType::TableInput->value,
            QuestionType::Calculation->value => AnswerInteractionType::CalculationWithWorking->value,
            QuestionType::DiagramLabel->value => $requiresVisualReference
                ? AnswerInteractionType::DiagramAnnotation->value
                : AnswerInteractionType::CanvasDraw->value,
            QuestionType::MultiplePart->value => AnswerInteractionType::MultiField->value,
            QuestionType::Essay->value => AnswerInteractionType::LongText->value,
            default => AnswerInteractionType::LongText->value,
        };
    }

    public function defaultConfig(string $type, bool $requiresVisualReference = false): array
    {
        return match ($type) {
            AnswerInteractionType::SelectSingle->value,
            AnswerInteractionType::McqSingle->value => ['options' => []],
            AnswerInteractionType::SelectMultiple->value,
            AnswerInteractionType::McqMultiple->value => ['options' => []],
            AnswerInteractionType::MultiField->value => ['fields' => []],
            AnswerInteractionType::TableInput->value => ['columns' => [], 'rows' => []],
            AnswerInteractionType::CalculationWithWorking->value => [
                'final_answer_label' => 'Final Answer',
                'working_label' => 'Working',
                'allow_units' => true,
            ],
            AnswerInteractionType::CanvasDraw->value => ['canvas' => $this->defaultCanvasConfig('plain')],
            AnswerInteractionType::GraphPlot->value => [
                'canvas' => $this->defaultCanvasConfig('graph', allowGrid: true),
                'graph_axes' => [
                    'x_label' => '',
                    'y_label' => '',
                    'show_axes' => true,
                ],
            ],
            AnswerInteractionType::CanvasPlusText->value => [
                'canvas' => $this->defaultCanvasConfig('plain'),
                'text_response' => ['label' => 'Explanation / notes'],
            ],
            AnswerInteractionType::DiagramAnnotation->value => [
                'base_image_required' => $requiresVisualReference,
                'canvas_overlay' => true,
                'allow_text_labels' => true,
            ],
            AnswerInteractionType::ImageUpload->value => [
                'allow_multiple' => false,
                'notes_label' => 'Notes',
            ],
            AnswerInteractionType::Matching->value => ['pairs' => []],
            default => [],
        };
    }

    public function summarizeAnswer(string $type, ?string $studentAnswer, ?array $structuredAnswer = null): string
    {
        $structuredAnswer ??= [];
        $studentAnswer = trim((string) $studentAnswer);

        return match ($type) {
            AnswerInteractionType::ShortText->value,
            AnswerInteractionType::LongText->value,
            AnswerInteractionType::SelectSingle->value,
            AnswerInteractionType::McqSingle->value => $studentAnswer !== '' ? $studentAnswer : trim((string) Arr::get($structuredAnswer, 'value', '')),
            AnswerInteractionType::SelectMultiple->value,
            AnswerInteractionType::McqMultiple->value => implode(', ', array_filter(Arr::wrap(Arr::get($structuredAnswer, 'values', [])))),
            AnswerInteractionType::MultiField->value => collect(Arr::get($structuredAnswer, 'fields', []))
                ->map(fn ($value, $key) => sprintf('%s: %s', $key, trim((string) $value)))
                ->filter(fn ($value) => ! str_ends_with($value, ': '))
                ->implode("\n"),
            AnswerInteractionType::TableInput->value => collect(Arr::get($structuredAnswer, 'rows', []))
                ->map(fn ($value, $key) => sprintf('%s: %s', $key, trim((string) $value)))
                ->filter(fn ($value) => ! str_ends_with($value, ': '))
                ->implode("\n"),
            AnswerInteractionType::CalculationWithWorking->value => trim(implode("\n\n", array_filter([
                Arr::get($structuredAnswer, 'final_answer') ? 'Final answer: '.Arr::get($structuredAnswer, 'final_answer') : null,
                Arr::get($structuredAnswer, 'working') ? 'Working: '.Arr::get($structuredAnswer, 'working') : null,
            ]))),
            AnswerInteractionType::CanvasDraw->value,
            AnswerInteractionType::GraphPlot->value,
            AnswerInteractionType::DiagramAnnotation->value,
            AnswerInteractionType::ImageUpload->value => $this->summarizeAssetAnswer($type, $structuredAnswer),
            AnswerInteractionType::CanvasPlusText->value => trim(implode("\n\n", array_filter([
                $this->summarizeAssetAnswer($type, $structuredAnswer),
                Arr::get($structuredAnswer, 'text') ? 'Notes: '.Arr::get($structuredAnswer, 'text') : null,
            ]))),
            AnswerInteractionType::Matching->value => collect(Arr::get($structuredAnswer, 'matches', []))
                ->map(fn ($value, $key) => sprintf('%s -> %s', $key, trim((string) $value)))
                ->implode("\n"),
            default => $studentAnswer,
        };
    }

    public function isBlank(?string $studentAnswer, ?array $structuredAnswer = null): bool
    {
        if (trim((string) $studentAnswer) !== '') {
            return false;
        }

        return $this->arrayIsBlank($structuredAnswer ?? []);
    }

    public function assertValidConfig(string $type, array $config, string $errorKey = 'interaction_config'): void
    {
        $fail = fn (string $message) => throw ValidationException::withMessages([$errorKey => $message]);

        $requireStringArray = function (string $key) use ($config, $fail): void {
            $value = Arr::get($config, $key);
            if (! is_array($value)) {
                $fail("{$key} must be an array.");
            }
            foreach ($value as $entry) {
                if (! is_string($entry)) {
                    $fail("{$key} entries must be strings.");
                }
            }
        };

        switch ($type) {
            case AnswerInteractionType::SelectSingle->value:
            case AnswerInteractionType::SelectMultiple->value:
            case AnswerInteractionType::McqSingle->value:
            case AnswerInteractionType::McqMultiple->value:
                $requireStringArray('options');
                break;

            case AnswerInteractionType::MultiField->value:
                $fields = Arr::get($config, 'fields');
                if (! is_array($fields)) {
                    $fail('fields must be an array.');
                }
                foreach ($fields as $field) {
                    if (! is_array($field) || blank($field['key'] ?? null) || blank($field['label'] ?? null)) {
                        $fail('Each multi_field entry requires key and label.');
                    }
                }
                break;

            case AnswerInteractionType::TableInput->value:
                if (! is_array(Arr::get($config, 'columns')) || ! is_array(Arr::get($config, 'rows'))) {
                    $fail('table_input requires columns and rows arrays.');
                }
                break;

            case AnswerInteractionType::CalculationWithWorking->value:
                if (blank(Arr::get($config, 'final_answer_label')) || blank(Arr::get($config, 'working_label'))) {
                    $fail('calculation_with_working requires final_answer_label and working_label.');
                }
                break;

            case AnswerInteractionType::CanvasDraw->value:
            case AnswerInteractionType::GraphPlot->value:
            case AnswerInteractionType::CanvasPlusText->value:
                $canvas = Arr::get($config, 'canvas');
                if (! is_array($canvas)) {
                    $fail('canvas configuration is required.');
                }
                $this->assertValidCanvasConfig($canvas, $errorKey, $fail);
                break;

            case AnswerInteractionType::DiagramAnnotation->value:
                if (! array_key_exists('base_image_required', $config)) {
                    $fail('diagram_annotation requires base_image_required.');
                }
                break;

            case AnswerInteractionType::Matching->value:
                if (! is_array(Arr::get($config, 'pairs'))) {
                    $fail('matching requires a pairs array.');
                }
                break;

            default:
                break;
        }
    }

    private function assertValidCanvasConfig(array $canvas, string $errorKey, callable $fail): void
    {
        if (! is_numeric($canvas['width'] ?? null) || ! is_numeric($canvas['height'] ?? null)) {
            $fail('canvas width and height are required.');
        }

        $mode = $canvas['background_mode'] ?? 'plain';
        if (! in_array($mode, ['plain', 'graph'], true)) {
            $fail('canvas background_mode must be plain or graph.');
        }
    }

    private function defaultCanvasConfig(string $backgroundMode, bool $allowGrid = false): array
    {
        return [
            'width' => 900,
            'height' => 500,
            'background_mode' => $backgroundMode,
            'allow_pen' => true,
            'allow_eraser' => true,
            'allow_clear' => true,
            'allow_grid' => $allowGrid,
        ];
    }

    private function summarizeAssetAnswer(string $type, array $structuredAnswer): string
    {
        $assetId = Arr::get($structuredAnswer, 'drawing_asset_id')
            ?? Arr::get($structuredAnswer, 'annotation_asset_id')
            ?? Arr::get($structuredAnswer, 'upload_asset_id');

        $summary = $assetId ? 'Student submitted an asset' : 'Student used a non-text response';
        if ($assetId) {
            $summary .= " (asset #{$assetId})";
        }

        $notes = trim((string) (Arr::get($structuredAnswer, 'notes') ?? Arr::get($structuredAnswer, 'text') ?? ''));

        return $notes !== '' ? $summary."\nNotes: {$notes}" : $summary;
    }

    private function arrayIsBlank(array $value): bool
    {
        foreach ($value as $entry) {
            if (is_array($entry) && ! $this->arrayIsBlank($entry)) {
                return false;
            }

            if (! is_array($entry) && trim((string) $entry) !== '') {
                return false;
            }
        }

        return true;
    }
}
