<?php

namespace App\Policies;

use App\Models\PaperAttempt;
use App\Models\User;

class PaperAttemptPolicy
{
    public function view(User $user, PaperAttempt $attempt): bool
    {
        return $user->isAdmin() || $attempt->user_id === $user->id;
    }

    public function update(User $user, PaperAttempt $attempt): bool
    {
        return $attempt->user_id === $user->id;
    }

    public function submit(User $user, PaperAttempt $attempt): bool
    {
        return $attempt->user_id === $user->id;
    }

    public function review(User $user, PaperAttempt $attempt): bool
    {
        return $user->isAdmin() || $attempt->user_id === $user->id;
    }
}
