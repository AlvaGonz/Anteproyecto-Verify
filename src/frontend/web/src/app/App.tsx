import { RouterProvider } from "react-router-dom";
import { router } from "../router";
import { ToastProvider } from "../shared/components/ui/Toast/ToastContext";
import { ErrorBoundary } from "./ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ErrorBoundary>
  );
}
