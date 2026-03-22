<?php

namespace App\Policies;

use App\Models\Paper;
use App\Models\User;

class PaperPolicy
{
    public function viewAdmin(User $user): bool
    {
        return $user->isAdmin();
    }

    public function manage(User $user, ?Paper $paper = null): bool
    {
        return $user->isAdmin();
    }
}
