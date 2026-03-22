<?php

namespace Database\Seeders;

use App\Models\Paper;
use App\Models\QuestionRubric;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class DemoPaperSeeder extends Seeder
{
    public function run(): void
    {
        $subject = Subject::query()->where('slug', 'biology-0610')->first();

        if (! $subject) {
            return;
        }

        $paper = Paper::query()->updateOrCreate(
            ['slug' => 'biology-paper-1-demo'],
            [
                'subject_id' => $subject->id,
                'title' => 'Biology Paper 1 Demo',
                'paper_code' => 'P1',
                'year' => 2025,
                'session' => 'May/June',
                'duration_minutes' => 75,
                'total_marks' => 9,
                'instructions' => 'Answer all questions. Submit the whole paper before you can see the review.',
                'is_published' => true,
            ],
        );

        $definitions = [
            [
                'question_number' => '1',
                'question_key' => '1(a)',
                'question_text' => 'State two raw materials needed for photosynthesis.',
                'reference_answer' => 'Carbon dioxide and water.',
                'max_marks' => 2,
                'marking_guidelines' => 'Award one mark each for carbon dioxide and water.',
                'keywords' => ['carbon dioxide', 'water'],
            ],
            [
                'question_number' => '1',
                'question_key' => '1(b)',
                'question_text' => 'Explain the role of chlorophyll in photosynthesis.',
                'reference_answer' => 'Chlorophyll absorbs light energy for photosynthesis.',
                'max_marks' => 3,
                'marking_guidelines' => 'Mention absorption of light energy linked to photosynthesis.',
                'keywords' => ['chlorophyll', 'light', 'energy'],
            ],
            [
                'question_number' => '2',
                'question_key' => '2(a)',
                'question_text' => 'Give two reasons why a larger sample size improves an experiment.',
                'reference_answer' => 'It reduces the effect of anomalies and improves reliability.',
                'max_marks' => 4,
                'marking_guidelines' => 'Allow answers about reliability, anomalies, and more representative data.',
                'keywords' => ['reliability', 'anomalies', 'representative'],
            ],
        ];

        foreach ($definitions as $index => $definition) {
            $question = $paper->questions()->updateOrCreate(
                ['paper_id' => $paper->id, 'question_key' => $definition['question_key']],
                [
                    'question_number' => $definition['question_number'],
                    'question_text' => $definition['question_text'],
                    'reference_answer' => $definition['reference_answer'],
                    'max_marks' => $definition['max_marks'],
                    'marking_guidelines' => $definition['marking_guidelines'],
                    'order_index' => $index + 1,
                ],
            );

            QuestionRubric::query()->updateOrCreate(
                ['paper_question_id' => $question->id],
                [
                    'keywords_expected' => $definition['keywords'],
                    'marker_notes' => $definition['marking_guidelines'],
                ],
            );
        }
    }
}
