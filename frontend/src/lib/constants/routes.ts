export const routes = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  papers: {
    index: '/papers',
    detail: '/papers/:paperId',
    byId: (paperId: string | number) => `/papers/${paperId}`,
  },
  attempts: {
    take: '/attempts/:attemptId/take',
    marking: '/attempts/:attemptId/marking',
    results: '/attempts/:attemptId/results',
    review: '/attempts/:attemptId/review',
    takeById: (attemptId: string | number) => `/attempts/${attemptId}/take`,
    markingById: (attemptId: string | number) => `/attempts/${attemptId}/marking`,
    resultsById: (attemptId: string | number) => `/attempts/${attemptId}/results`,
    reviewById: (attemptId: string | number) => `/attempts/${attemptId}/review`,
  },
  admin: {
    dashboard: '/admin',
    papers: {
      index: '/admin/papers',
      create: '/admin/papers/new',
      edit: '/admin/papers/:paperId/edit',
      byId: (paperId: string | number) => `/admin/papers/${paperId}/edit`,
    },
    questions: {
      edit: '/admin/questions/:questionId/edit',
      byId: (questionId: string | number) => `/admin/questions/${questionId}/edit`,
    },
    imports: {
      create: '/admin/imports/new',
      review: '/admin/imports/:importId/review',
      byId: (importId: string | number) => `/admin/imports/${importId}/review`,
    },
  },
} as const
