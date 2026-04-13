import { RouterProvider } from "react-router-dom";
import { router } from "../router";
import { ToastProvider } from "../shared/components/ui/Toast/ToastContext";
import { ErrorBoundary } from "./ErrorBoundary";

import { AuthProvider } from "../features/auth/context/AuthContext";

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
