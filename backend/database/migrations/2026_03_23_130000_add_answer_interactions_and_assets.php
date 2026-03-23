<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_import_items', function (Blueprint $table) {
            $table->string('answer_interaction_type')->default('short_text')->after('question_type');
            $table->json('interaction_config')->nullable()->after('answer_interaction_type');
        });

        Schema::table('paper_questions', function (Blueprint $table) {
            $table->string('answer_interaction_type')->default('short_text')->after('question_type');
            $table->json('interaction_config')->nullable()->after('answer_interaction_type');
        });

        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->json('structured_answer')->nullable()->after('student_answer');
        });

        Schema::create('attempt_answer_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_answer_id')->constrained()->cascadeOnDelete();
            $table->string('asset_type');
            $table->string('disk')->default('public');
            $table->string('file_path');
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['attempt_answer_id', 'asset_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_answer_assets');

        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->dropColumn('structured_answer');
        });

        Schema::table('paper_questions', function (Blueprint $table) {
            $table->dropColumn(['answer_interaction_type', 'interaction_config']);
        });

        Schema::table('document_import_items', function (Blueprint $table) {
            $table->dropColumn(['answer_interaction_type', 'interaction_config']);
        });
    }
};
