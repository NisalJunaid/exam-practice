<?php

namespace App\Providers;

use App\Models\DocumentImport;
use App\Models\PaperAttempt;
use App\Policies\DocumentImportPolicy;
use App\Policies\PaperAttemptPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        PaperAttempt::class => PaperAttemptPolicy::class,
        DocumentImport::class => DocumentImportPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
