<?php

namespace App\Providers;

use App\Services\AI\FakeMarkingProvider;
use App\Services\AI\OpenAIClient;
use App\Services\Marking\Contracts\MarkingProvider;
use GuzzleHttp\Client;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(MarkingProvider::class, function () {
            $provider = config('ai_marking.provider', 'fake');

            return match ($provider) {
                'fake' => new FakeMarkingProvider(config('ai_marking.model', 'deterministic-reviewer')),
                'openai' => new OpenAIClient(
                    http: new Client,
                    apiKey: (string) config('ai_marking.openai.api_key', ''),
                    model: (string) config('ai_marking.model', 'gpt-4.1-mini'),
                    baseUrl: (string) config('ai_marking.openai.base_url', 'https://api.openai.com/v1'),
                    timeoutSeconds: (int) config('ai_marking.openai.timeout', 30),
                ),
                default => throw new InvalidArgumentException(sprintf('Unsupported AI marking provider [%s].', $provider)),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
