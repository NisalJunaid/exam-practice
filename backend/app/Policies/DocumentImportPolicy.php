<?php

namespace App\Policies;

use App\Models\DocumentImport;
use App\Models\User;

class DocumentImportPolicy
{
    public function view(User $user, DocumentImport $documentImport): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, DocumentImport $documentImport): bool
    {
        return $user->isAdmin();
    }
}
