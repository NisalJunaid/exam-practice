export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  student: {
    catalog: '/student/catalog',
    papers: '/student/papers',
    paper: (paperId: string | number) => `/student/papers/${paperId}`,
    attempts: {
      create: (paperId: string | number) => `/student/papers/${paperId}/attempts`,
      detail: (attemptId: string | number) => `/student/attempts/${attemptId}`,
      answers: (attemptId: string | number) => `/student/attempts/${attemptId}/answers`,
      submit: (attemptId: string | number) => `/student/attempts/${attemptId}/submit`,
      results: (attemptId: string | number) => `/student/attempts/${attemptId}/results`,
      review: (attemptId: string | number) => `/student/attempts/${attemptId}/review`,
    },
  },
  admin: {
    papers: '/admin/papers',
    paper: (paperId: string | number) => `/admin/papers/${paperId}`,
    publish: (paperId: string | number) => `/admin/papers/${paperId}/publish`,
    createQuestion: (paperId: string | number) => `/admin/papers/${paperId}/questions`,
    question: (questionId: string | number) => `/admin/questions/${questionId}`,
    updateRubric: (questionId: string | number) => `/admin/questions/${questionId}/rubric`,
    imports: '/admin/imports',
    import: (importId: string | number) => `/admin/imports/${importId}`,
    importItems: (importId: string | number) => `/admin/imports/${importId}/items`,
    importItem: (itemId: string | number) => `/admin/import-items/${itemId}`,
    approveImport: (importId: string | number) => `/admin/imports/${importId}/approve`,
  },
} as const
