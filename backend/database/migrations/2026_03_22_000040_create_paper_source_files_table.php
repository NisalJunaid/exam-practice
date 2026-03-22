<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paper_source_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('document_import_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('file_role');
            $table->string('disk')->default('local');
            $table->string('path');
            $table->string('original_name');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('checksum')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['paper_id', 'file_role']);
            $table->index(['document_import_id', 'file_role']);
            $table->index(['created_by', 'file_role']);
            $table->index('checksum');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_source_files');
    }
};
