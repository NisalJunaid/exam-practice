<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('question_visual_assets', function (Blueprint $table) {
            $table->string('alt_text')->nullable()->after('original_name');
            $table->string('caption')->nullable()->after('alt_text');
        });
    }

    public function down(): void
    {
        Schema::table('question_visual_assets', function (Blueprint $table) {
            $table->dropColumn(['alt_text', 'caption']);
        });
    }
};
