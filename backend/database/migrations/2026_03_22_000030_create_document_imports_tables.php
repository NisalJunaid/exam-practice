<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('status');
            $table->string('question_paper_path');
            $table->string('question_paper_name');
            $table->string('mark_scheme_path');
            $table->string('mark_scheme_name');
            $table->json('metadata')->nullable();
            $table->json('summary')->nullable();
            $table->json('raw_extraction_payload')->nullable();
            $table->longText('review_notes')->nullable();
            $table->foreignId('approved_paper_id')->nullable()->constrained('papers')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['created_by', 'status']);
            $table->index('approved_paper_id');
        });

        Schema::create('document_import_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_import_id')->constrained()->cascadeOnDelete();
            $table->string('question_key');
            $table->string('question_number')->nullable();
            $table->longText('question_text');
            $table->longText('reference_answer')->nullable();
            $table->longText('marking_guidelines')->nullable();
            $table->unsignedInteger('question_paper_marks')->nullable();
            $table->unsignedInteger('mark_scheme_marks')->nullable();
            $table->unsignedInteger('resolved_max_marks')->nullable();
            $table->string('match_status');
            $table->unsignedInteger('page_number')->nullable();
            $table->unsignedInteger('order_index')->default(1);
            $table->boolean('is_approved')->default(false);
            $table->longText('admin_notes')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index(['document_import_id', 'order_index']);
            $table->index(['document_import_id', 'match_status']);
            $table->index(['question_key', 'match_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_import_items');
        Schema::dropIfExists('document_imports');
    }
};
