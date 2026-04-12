import { createHashRouter, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { HealthPage } from "../pages/HealthPage";
import { ProjectsPublicListPage } from "../pages/projects/ProjectsPublicListPage";
import { ProjectPublicDetailPage } from "../pages/projects/ProjectPublicDetailPage";
import { ProjectManagePage } from "../pages/projects/ProjectManagePage";
import { ProjectDocumentsPage } from "../pages/projects/ProjectDocumentsPage";
import { ProjectValidationPage } from "../pages/projects/ProjectValidationPage";
import { ProjectAuditPage } from "../pages/admin/ProjectAuditPage";
import { ProjectReportsPage } from "../pages/admin/ProjectReportsPage";
import { RulesManagePage } from "../pages/admin/RulesManagePage";
import { PublicVerifySearchPage } from "../pages/public/PublicVerifySearchPage";
import { PublicVerifyResultPage } from "../pages/public/PublicVerifyResultPage";
import { PublicVerificationPage } from "../pages/public/PublicVerificationPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

import { AdminLayout } from "../shared/components/layout/AdminLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { AdminProjectsPage } from "../pages/admin/AdminProjectsPage";
import { AuthGuard } from "../shared/components/security/AuthGuard";
import { ErrorBoundary } from "../shared/components/layout/ErrorBoundary";

export const router = createHashRouter([
  {
    path: "/",
    errorElement: <ErrorBoundary />,
    children: [
      /* ===== Landing Page ===== */
      {
        index: true,
        element: <LandingPage />,
      },

      /* ===== Public Pages ===== */
      {
        path: "/consulta-publica",
        element: <PublicVerificationPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/verify",
        element: <PublicVerifySearchPage />,
      },
      {
        path: "/verify/:code",
        element: <PublicVerifyResultPage />,
      },
      {
        path: "/health",
        element: <HealthPage />,
      },
      {
        path: "/projects",
        element: <ProjectsPublicListPage />,
      },
      {
        path: "/projects/:id",
        element: <ProjectPublicDetailPage />,
      },

      /* ===== Admin Pages ===== */
      {
        path: "/admin",
        element: (
          <AuthGuard>
            <AdminLayout>
              <Navigate to="/admin/dashboard" replace />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/dashboard",
        element: (
          <AuthGuard>
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects",
        element: (
          <AuthGuard>
            <AdminLayout>
              <AdminProjectsPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/new",
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectManagePage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/:id/edit",
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectManagePage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/:id/documents",
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectDocumentsPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/:id/validations",
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectValidationPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/:id/audit",
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectAuditPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/:id/reports",
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectReportsPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/rules",
        element: (
          <AuthGuard>
            <AdminLayout>
              <RulesManagePage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "*",
        element: <ErrorBoundary />,
      }
    ]
  }
]);
