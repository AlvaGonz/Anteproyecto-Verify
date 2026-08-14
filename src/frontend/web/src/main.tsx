import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LazyMotion, domAnimation } from "framer-motion";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { App } from "./app/App";
import { queryClient } from "./infrastructure/api/queryClient";

import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="797027452723-etnu208qn9fq2rgi3ojn4ogn9va9u6mr.apps.googleusercontent.com">
      <QueryClientProvider client={queryClient}>
        <LazyMotion features={domAnimation}>
          <App />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </LazyMotion>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
