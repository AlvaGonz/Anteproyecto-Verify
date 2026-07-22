import { lazy, Suspense } from "react";
import { createHashRouter, Navigate, Outlet, useParams } from "react-router-dom";

const LandingPage = lazy(() => import("../pages/LandingPage").then(m => ({ default: m.LandingPage })));
const HealthPage = lazy(() => import("../pages/HealthPage").then(m => ({ default: m.HealthPage })));
const PricingPage = lazy(() => import("../features/pricing").then(m => ({ default: m.PricingPage })));
const LegalPage = lazy(() => import("../features/legal").then(m => ({ default: m.LegalPage })));
const CheckoutPage = lazy(() => import("../features/pricing/pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const CheckoutReturnPage = lazy(() => import("../features/pricing/pages/CheckoutReturnPage").then(m => ({ default: m.CheckoutReturnPage })));
const ProjectsPublicListPage = lazy(() => import("../pages/projects/ProjectsPublicListPage").then(m => ({ default: m.ProjectsPublicListPage })));
const ProjectPublicDetailPage = lazy(() => import("../pages/projects/ProjectPublicDetailPage").then(m => ({ default: m.ProjectPublicDetailPage })));
const ProjectManagePage = lazy(() => import("../pages/projects/ProjectManagePage").then(m => ({ default: m.ProjectManagePage })));
const ProjectManageLayout = lazy(() => import("../pages/projects/ProjectManageLayout").then(m => ({ default: m.ProjectManageLayout })));
const ProjectValidationPage = lazy(() => import("../pages/projects/ProjectValidationPage").then(m => ({ default: m.ProjectValidationPage })));
const ProjectAuditPage = lazy(() => import("../pages/admin/ProjectAuditPage").then(m => ({ default: m.ProjectAuditPage })));
const ProjectReportsPage = lazy(() => import("../pages/admin/ProjectReportsPage").then(m => ({ default: m.ProjectReportsPage })));
const RulesManagePage = lazy(() => import("../pages/admin/RulesManagePage").then(m => ({ default: m.RulesManagePage })));
const SettingsPage = lazy(() => import("../pages/admin/SettingsPage").then(m => ({ default: m.SettingsPage })));
const PublicVerifyResultPage = lazy(() => import("../pages/public/PublicVerifyResultPage").then(m => ({ default: m.PublicVerifyResultPage })));
const LoginPage = lazy(() => import("../pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage").then(m => ({ default: m.RegisterPage })));
const EmailVerifiedPage = lazy(() => import("../pages/auth/EmailVerifiedPage").then(m => ({ default: m.EmailVerifiedPage })));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const ProjectDocumentUploadPage = lazy(() => import("../pages/projects/ProjectDocumentUploadPage").then(m => ({ default: m.ProjectDocumentUploadPage })));
const AuditLogPage = lazy(() => import("../features/audit/pages/AuditLogPage").then(m => ({ default: m.AuditLogPage })));
const ValidationExecutionPage = lazy(() => import("../features/validations/pages/ValidationExecutionPage").then(m => ({ default: m.ValidationExecutionPage })));
const FindingsPage = lazy(() => import("../features/findings/FindingsPage").then(m => ({ default: m.FindingsPage })));
const AdminLayout = lazy(() => import("../shared/components/layout/AdminLayout").then(m => ({ default: m.AdminLayout })));
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const AdminProjectsPage = lazy(() => import("../pages/admin/AdminProjectsPage").then(m => ({ default: m.AdminProjectsPage })));
const PublishedProjectDetailPage = lazy(() => import("../pages/admin/PublishedProjectDetailPage").then(m => ({ default: m.PublishedProjectDetailPage })));
const CreateProjectPage = lazy(() => import("../pages/projects/CreateProjectPage").then(m => ({ default: m.CreateProjectPage })));
const EditProjectPage = lazy(() => import("../pages/projects/EditProjectPage").then(m => ({ default: m.EditProjectPage })));
const UploadDocumentPage = lazy(() => import("../pages/projects/UploadDocumentPage").then(m => ({ default: m.UploadDocumentPage })));
const CreateValidationPage = lazy(() => import("../pages/projects/CreateValidationPage").then(m => ({ default: m.CreateValidationPage })));

import { AuthGuard } from "../shared/components/security/AuthGuard";
import { GuestGuard } from "../shared/components/security/GuestGuard";
import { ErrorBoundary } from "../shared/components/layout/ErrorBoundary";
import { AdminErrorFallback } from "../components/ui/AdminErrorFallback";

const PageFallback = () => <div className="min-h-screen bg-slate-50" />;

const SuspenseLayout = () => (
  <Suspense fallback={<PageFallback />}>
    <Outlet />
  </Suspense>
);

const NavigateToVerifyResult: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  return <Navigate to={`/projects/verify/${code}`} replace />;
};

export const router = createHashRouter([
  {
    path: "/",
    element: <SuspenseLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "/legal",
        element: <LegalPage />,
      },
      {
        path: "/plans",
        element: <PricingPage />,
      },
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
        path: "/projects/publicados",
        element: <Navigate to="/projects" replace />,
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
        path: "/forgot-password",
        element: (
          <GuestGuard>
            <ForgotPasswordPage />
          </GuestGuard>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <GuestGuard>
            <ResetPasswordPage />
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
        element: (
          <AuthGuard>
            <ProjectPublicDetailPage />
          </AuthGuard>
        ),
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
        path: "/admin/projects/:id/publicado",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <PublishedProjectDetailPage />
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
              <ProjectManageLayout />
            </AdminLayout>
          </AuthGuard>
        ),
        children: [
          { index: true, element: <ProjectManagePage /> }
        ]
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
        path: "/admin/projects/:id",
        errorElement: <AdminErrorFallback />,
        element: (
          <AuthGuard>
            <AdminLayout>
              <ProjectManageLayout />
            </AdminLayout>
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Navigate to="edit" replace /> },
          { path: "edit", element: <ProjectManagePage /> },
          { path: "validations", element: <ProjectValidationPage /> },
          { path: "reports", element: <ProjectReportsPage /> },
          { path: "audit", element: <ProjectAuditPage /> }
        ]
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
