<?php

namespace App\Providers;

use App\Models\DocumentImport;
use App\Models\Paper;
use App\Models\PaperAttempt;
use App\Policies\DocumentImportPolicy;
use App\Policies\PaperAttemptPolicy;
use App\Policies\PaperPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        DocumentImport::class => DocumentImportPolicy::class,
        Paper::class => PaperPolicy::class,
        PaperAttempt::class => PaperAttemptPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
