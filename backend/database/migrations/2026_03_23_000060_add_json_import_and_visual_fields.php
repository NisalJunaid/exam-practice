<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_imports', function (Blueprint $table) {
            $table->string('input_method')->default('json_payload')->after('status');
            $table->string('json_file_path')->nullable()->after('mark_scheme_name');
            $table->string('json_file_name')->nullable()->after('json_file_path');
            $table->json('raw_json_payload')->nullable()->after('summary');
            $table->json('preview_payload')->nullable()->after('raw_json_payload');
        });

        Schema::table('document_import_items', function (Blueprint $table) {
            $table->string('question_type')->default('short_answer')->after('parent_key');
            $table->longText('sample_full_mark_answer')->nullable()->after('marking_guidelines');
            $table->boolean('requires_visual_reference')->default(false)->after('sample_full_mark_answer');
            $table->string('visual_reference_type')->nullable()->after('requires_visual_reference');
            $table->longText('visual_reference_note')->nullable()->after('visual_reference_type');
            $table->boolean('has_visual')->default(false)->after('visual_reference_note');
            $table->json('flags')->nullable()->after('has_visual');
        });

        Schema::table('paper_questions', function (Blueprint $table) {
            $table->string('question_type')->default('short_answer')->after('question_key');
            $table->boolean('requires_visual_reference')->default(false)->after('sample_full_mark_answer');
            $table->string('visual_reference_type')->nullable()->after('requires_visual_reference');
            $table->longText('visual_reference_note')->nullable()->after('visual_reference_type');
            $table->boolean('has_visual')->default(false)->after('visual_reference_note');
        });

        Schema::create('question_visual_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_question_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('document_import_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('asset_role');
            $table->string('disk')->default('public');
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->timestamps();

            $table->index(['document_import_item_id', 'asset_role']);
            $table->index(['paper_question_id', 'asset_role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_visual_assets');

        Schema::table('paper_questions', function (Blueprint $table) {
            $table->dropColumn([
                'question_type',
                'requires_visual_reference',
                'visual_reference_type',
                'visual_reference_note',
                'has_visual',
            ]);
        });

        Schema::table('document_import_items', function (Blueprint $table) {
            $table->dropColumn([
                'question_type',
                'sample_full_mark_answer',
                'requires_visual_reference',
                'visual_reference_type',
                'visual_reference_note',
                'has_visual',
                'flags',
            ]);
        });

        Schema::table('document_imports', function (Blueprint $table) {
            $table->dropColumn([
                'input_method',
                'json_file_path',
                'json_file_name',
                'raw_json_payload',
                'preview_payload',
            ]);
        });
    }
};
