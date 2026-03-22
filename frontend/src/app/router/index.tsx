import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

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

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route element={<RequireGuest />}>
            <Route path={routes.login} element={<LoginPage />} />
            <Route path={routes.register} element={<RegisterPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<StudentShell />}>
              <Route path={routes.dashboard} element={<DashboardPage />} />
              <Route path={routes.papers.index} element={<PaperCatalogPage />} />
              <Route path={routes.papers.detail} element={<PaperDetailPage />} />
              <Route path={routes.attempts.take} element={<TakeAttemptPage />} />
              <Route path={routes.attempts.marking} element={<MarkingProgressPage />} />
              <Route path={routes.attempts.results} element={<ResultsPage />} />
              <Route path={routes.attempts.review} element={<ReviewPage />} />
            </Route>
          </Route>

          <Route element={<RequireAdmin />}>
            <Route element={<AdminShell />}>
              <Route path={routes.admin.dashboard} element={<AdminDashboardPage />} />
              <Route path={routes.admin.papers.index} element={<AdminPaperListPage />} />
              <Route path={routes.admin.papers.create} element={<AdminPaperCreatePage />} />
              <Route path={routes.admin.papers.edit} element={<AdminEditPaperPage />} />
              <Route path={routes.admin.questions.edit} element={<AdminEditQuestionPage />} />
              <Route path={routes.admin.imports.create} element={<AdminImportPaperPage />} />
              <Route path={routes.admin.imports.review} element={<AdminImportReviewPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
