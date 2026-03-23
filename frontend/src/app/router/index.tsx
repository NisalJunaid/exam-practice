import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { RouterErrorBoundary } from '@/app/router/RouterErrorBoundary'
import { RequireAdmin, RequireAuth, RequireGuest } from '@/app/router/guards'
import { AdminShell } from '@/components/layout/AdminShell'
import { AppShell } from '@/components/layout/AppShell'
import { StudentShell } from '@/components/layout/StudentShell'
import { routes } from '@/lib/constants/routes'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminEditPaperPage } from '@/pages/admin/AdminEditPaperPage'
import { AdminEditQuestionPage } from '@/pages/admin/AdminEditQuestionPage'
import { AdminImportPaperPage } from '@/pages/admin/AdminImportPaperPage'
import { AdminImportReviewPage } from '@/pages/admin/AdminImportReviewPage'
import { AdminPaperCreatePage } from '@/pages/admin/AdminPaperCreatePage'
import { AdminPaperListPage } from '@/pages/admin/AdminPaperListPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { MarkingProgressPage } from '@/pages/MarkingProgressPage'
import { PaperCatalogPage } from '@/pages/PaperCatalogPage'
import { PaperDetailPage } from '@/pages/PaperDetailPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ReviewPage } from '@/pages/ReviewPage'
import { ResultsPage } from '@/pages/ResultsPage'
import { TakeAttemptPage } from '@/pages/TakeAttemptPage'

const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        element: <RequireGuest />,
        children: [
          { path: routes.login, element: <LoginPage /> },
          { path: routes.register, element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <StudentShell />,
            children: [
              { path: routes.dashboard, element: <DashboardPage /> },
              { path: routes.papers.index, element: <PaperCatalogPage /> },
              { path: routes.papers.detail, element: <PaperDetailPage /> },
              { path: routes.attempts.take, element: <TakeAttemptPage /> },
              { path: routes.attempts.marking, element: <MarkingProgressPage /> },
              { path: routes.attempts.results, element: <ResultsPage /> },
              { path: routes.attempts.review, element: <ReviewPage /> },
            ],
          },
        ],
      },
      {
        element: <RequireAdmin />,
        children: [
          {
            element: <AdminShell />,
            children: [
              { path: routes.admin.dashboard, element: <AdminDashboardPage /> },
              { path: routes.admin.papers.index, element: <AdminPaperListPage /> },
              { path: routes.admin.papers.create, element: <AdminPaperCreatePage /> },
              { path: routes.admin.papers.edit, element: <AdminEditPaperPage /> },
              { path: routes.admin.questions.edit, element: <AdminEditQuestionPage /> },
              { path: routes.admin.imports.create, element: <AdminImportPaperPage /> },
              { path: routes.admin.imports.review, element: <AdminImportReviewPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate replace to={routes.dashboard} /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
