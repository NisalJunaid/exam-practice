<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_imports', function (Blueprint $table) {
            $table->longText('error_message')->nullable()->after('review_notes');
        });

        Schema::table('document_import_items', function (Blueprint $table) {
            $table->string('parent_key')->nullable()->after('question_key');
            $table->longText('stem_context')->nullable()->after('question_number');
            $table->unsignedInteger('question_page_number')->nullable()->after('resolved_max_marks');
            $table->unsignedInteger('mark_scheme_page_number')->nullable()->after('question_page_number');
            $table->json('raw_question_payload')->nullable()->after('admin_notes');
            $table->json('raw_mark_scheme_payload')->nullable()->after('raw_question_payload');
        });
    }

    public function down(): void
    {
        Schema::table('document_import_items', function (Blueprint $table) {
            $table->dropColumn([
                'parent_key',
                'stem_context',
                'question_page_number',
                'mark_scheme_page_number',
                'raw_question_payload',
                'raw_mark_scheme_payload',
            ]);
        });

        Schema::table('document_imports', function (Blueprint $table) {
            $table->dropColumn('error_message');
        });
    }
};
