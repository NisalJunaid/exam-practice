export const queryKeys = {
  all: ['api'] as const,
  auth: {
    me: ['api', 'auth', 'me'] as const,
  },
  catalog: {
    filters: ['api', 'catalog', 'filters'] as const,
  },
  papers: {
    all: ['api', 'papers'] as const,
    list: <T extends object>(filters: T) => ['api', 'papers', 'list', filters] as const,
    detail: (paperId: string | number) => ['api', 'papers', 'detail', paperId] as const,
  },
  attempts: {
    all: ['api', 'attempts'] as const,
    detail: (attemptId: string | number) => ['api', 'attempts', 'detail', attemptId] as const,
    results: (attemptId: string | number) => ['api', 'attempts', 'results', attemptId] as const,
    review: (attemptId: string | number) => ['api', 'attempts', 'review', attemptId] as const,
  },
  admin: {
    papers: ['api', 'admin', 'papers'] as const,
    paper: (paperId: string | number) => ['api', 'admin', 'papers', paperId] as const,
    question: (questionId: string | number) => ['api', 'admin', 'questions', questionId] as const,
    imports: ['api', 'admin', 'imports'] as const,
    import: (importId: string | number) => ['api', 'admin', 'imports', importId] as const,
    importItems: (importId: string | number) => ['api', 'admin', 'imports', importId, 'items'] as const,
  },
} as const
