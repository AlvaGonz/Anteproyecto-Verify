import { lazy, Suspense } from "react";
import { createHashRouter, Navigate, useParams } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { HealthPage } from "../pages/HealthPage";

const LegalPage = lazy(() => import("../features/legal").then(m => ({ default: m.LegalPage })));
const PricingPage = lazy(() => import("../features/pricing").then(m => ({ default: m.PricingPage })));
const CheckoutPage = lazy(() => import("../features/pricing/pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const CheckoutReturnPage = lazy(() => import("../features/pricing/pages/CheckoutReturnPage").then(m => ({ default: m.CheckoutReturnPage })));
import { ProjectsPublicListPage } from "../pages/projects/ProjectsPublicListPage";
import { ProjectPublicDetailPage } from "../pages/projects/ProjectPublicDetailPage";
import { ProjectManagePage } from "../pages/projects/ProjectManagePage";
import { ProjectDocumentsPage } from "../pages/projects/ProjectDocumentsPage";
import { ProjectValidationPage } from "../pages/projects/ProjectValidationPage";
import { ProjectAuditPage } from "../pages/admin/ProjectAuditPage";
import { ProjectReportsPage } from "../pages/admin/ProjectReportsPage";
import { RulesManagePage } from "../pages/admin/RulesManagePage";
import { SettingsPage } from "../pages/admin/SettingsPage";
import { PublicVerifyResultPage } from "../pages/public/PublicVerifyResultPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { EmailVerifiedPage } from "../pages/auth/EmailVerifiedPage";
import { ProjectDocumentUploadPage } from "../pages/projects/ProjectDocumentUploadPage";
import { AuditLogPage } from "../features/audit/pages/AuditLogPage";
import { ValidationExecutionPage } from "../features/validations/pages/ValidationExecutionPage";
import { FindingsPage } from "../features/findings/FindingsPage";

import { AdminLayout } from "../shared/components/layout/AdminLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { AdminProjectsPage } from "../pages/admin/AdminProjectsPage";
import { AuthGuard } from "../shared/components/security/AuthGuard";
import { GuestGuard } from "../shared/components/security/GuestGuard";
import { ErrorBoundary } from "../shared/components/layout/ErrorBoundary";

// New Pages
import { CreateProjectPage } from "../pages/projects/CreateProjectPage";
import { EditProjectPage } from "../pages/projects/EditProjectPage";
import { UploadDocumentPage } from "../pages/projects/UploadDocumentPage";
import { CreateValidationPage } from "../pages/projects/CreateValidationPage";
import { AdminErrorFallback } from "../components/ui/AdminErrorFallback";
const NavigateToVerifyResult: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  return <Navigate to={`/projects/verify/${code}`} replace />;
};

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
      {
        path: "/legal",
        element: (
          <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="font-body text-on-surface-variant">Cargando...</span></div>}>
            <LegalPage />
          </Suspense>
        ),
      },
      {
        path: "/precios",
        element: (
          <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="font-body text-on-surface-variant">Cargando...</span></div>}>
            <PricingPage />
          </Suspense>
        ),
      },

      /* ===== Public Pages ===== */
      {
        path: "/portal",
        element: <Navigate to="/projects" replace />,
      },
      {
        path: "/consulta-publica",
        element: <Navigate to="/projects" replace />,
      },
      {
        path: "/projects",
        element: <ProjectsPublicListPage />,
      },
      {
        path: "/login",
        element: (
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        ),
      },
      {
        path: "/register",
        element: (
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: "/verify-email",
        element: (
          <GuestGuard>
            <EmailVerifiedPage />
          </GuestGuard>
        ),
      },
      {
        path: "/verify",
        element: <Navigate to="/projects" replace />,
      },
      {
        path: "/verify/:code",
        element: <NavigateToVerifyResult />,
      },
      {
        path: "/projects/verify/:code",
        element: <PublicVerifyResultPage />,
      },
      {
        path: "/health",
        element: <HealthPage />,
      },
      {
        path: "/p/:slug",
        element: <ProjectPublicDetailPage />,
      },
      {
        path: "/checkout",
        element: (
          <AuthGuard>
            <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Cargando...</div>}>
              <CheckoutPage />
            </Suspense>
          </AuthGuard>
        ),
      },
      {
        path: "/checkout/return",
        element: (
          <AuthGuard>
            <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Cargando...</div>}>
              <CheckoutReturnPage />
            </Suspense>
          </AuthGuard>
        ),
      },

      /* ===== New Spec Routes ===== */
      {
        path: "/projects/new",
        element: (
          <AuthGuard>
            <CreateProjectPage />
          </AuthGuard>
        ),
      },
      {
        path: "/projects/:id/edit",
        element: (
          <AuthGuard>
            <EditProjectPage />
          </AuthGuard>
        ),
      },
      {
        path: "/projects/:id/documents/upload",
        element: (
          <AuthGuard>
            <UploadDocumentPage />
          </AuthGuard>
        ),
      },
      {
        path: "/projects/:id/validations/new",
        element: (
          <AuthGuard>
            <CreateValidationPage />
          </AuthGuard>
        ),
      },

      /* ===== Admin Pages ===== */
      {
        path: "/admin/expedientes",
        element: <Navigate to="/admin/projects" replace />,
      },
      {
        path: "/admin/validation-rules",
        element: <Navigate to="/admin/rules" replace />,
      },
      {
        path: "/admin",
        errorElement: <AdminErrorFallback />,
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
        errorElement: <AdminErrorFallback />,
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
        errorElement: <AdminErrorFallback />,
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
        errorElement: <AdminErrorFallback />,
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
        errorElement: <AdminErrorFallback />,
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
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectDocumentsPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/:id/upload",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <ProjectDocumentUploadPage />
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/:id/validations",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectValidationPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/validations/:projectId",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <ValidationExecutionPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/projects/:id/audit",
        errorElement: <AdminErrorFallback />,
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
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectReportsPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/findings/:projectId",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <FindingsPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/rules",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <RulesManagePage />
            </AdminLayout>
          </AuthGuard>
        ),
      },
      {
        path: "/admin/settings",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <SettingsPage />
            </AdminLayout>
          </AuthGuard>
        ),
      },

      {
        path: "/admin/audit-log",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <AuditLogPage />
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
