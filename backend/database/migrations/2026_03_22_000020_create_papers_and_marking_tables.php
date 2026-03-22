<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('papers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('paper_code')->nullable();
            $table->unsignedInteger('year')->nullable();
            $table->string('session')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->unsignedInteger('total_marks')->default(0);
            $table->longText('instructions')->nullable();
            $table->boolean('is_published')->default(false);
            $table->string('source_question_paper_path')->nullable();
            $table->string('source_mark_scheme_path')->nullable();
            $table->timestamps();
        });

        Schema::create('paper_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained()->cascadeOnDelete();
            $table->string('question_number');
            $table->string('question_key')->nullable();
            $table->longText('question_text');
            $table->longText('reference_answer')->nullable();
            $table->unsignedInteger('max_marks');
            $table->longText('marking_guidelines')->nullable();
            $table->longText('sample_full_mark_answer')->nullable();
            $table->unsignedInteger('order_index')->default(1);
            $table->longText('stem_context')->nullable();
            $table->timestamps();
        });

        Schema::create('question_rubrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_question_id')->constrained()->cascadeOnDelete();
            $table->longText('band_descriptor')->nullable();
            $table->json('keywords_expected')->nullable();
            $table->json('common_mistakes')->nullable();
            $table->json('acceptable_alternatives')->nullable();
            $table->longText('marker_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('paper_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('paper_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('total_awarded_marks')->nullable();
            $table->unsignedInteger('total_max_marks');
            $table->longText('marking_summary')->nullable();
            $table->timestamps();
        });

        Schema::create('attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('paper_question_id')->constrained()->cascadeOnDelete();
            $table->longText('student_answer')->nullable();
            $table->boolean('is_blank')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('attempt_markings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attempt_answer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('paper_question_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('awarded_marks');
            $table->unsignedInteger('max_marks');
            $table->longText('reasoning');
            $table->longText('feedback');
            $table->json('strengths')->nullable();
            $table->json('mistakes')->nullable();
            $table->decimal('ai_confidence', 5, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('ai_marking_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attempt_answer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('provider');
            $table->string('model_name');
            $table->longText('request_payload');
            $table->longText('response_payload')->nullable();
            $table->string('status');
            $table->longText('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_marking_logs');
        Schema::dropIfExists('attempt_markings');
        Schema::dropIfExists('attempt_answers');
        Schema::dropIfExists('paper_attempts');
        Schema::dropIfExists('question_rubrics');
        Schema::dropIfExists('paper_questions');
        Schema::dropIfExists('papers');
    }
};
