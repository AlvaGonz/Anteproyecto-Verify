import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { isSubscriptionActive } from "../../../features/pricing/utils/planPermissions";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location.pathname.startsWith('/checkout')) {
      return <Navigate to={`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // ponytail: if user has a pending plan but no active subscription, redirect to checkout
  // skip redirect if already on checkout to avoid redirect loops
  if (
    user?.pendingPlanCode && 
    !isSubscriptionActive(user.subscriptionStatus) && 
    !location.pathname.startsWith('/checkout') && 
    user?.rol !== 'Administrator' && 
    user?.role !== 'Administrator'
  ) {
    return <Navigate to={`/checkout?plan=${user.pendingPlanCode}&billing=${user.pendingBillingCycle || 'monthly'}`} replace />;
  }

  return <>{children}</>;
};
