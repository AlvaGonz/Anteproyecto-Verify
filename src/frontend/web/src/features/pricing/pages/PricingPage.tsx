import React, { useState, useEffect } from "react";
import { useAuth } from "../../../shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PricingPageLayout } from "./PricingPageLayout";

export const PricingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();

  const handlePaidPlan = (plan: 'profesional' | 'empresa' | 'corporativo') => {
    const billing = isAnnual ? 'yearly' : 'monthly';
    const targetUrl = `/checkout?plan=${plan}&billing=${billing}`;
    if (!isAuthenticated) {
      navigate(`/register?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      navigate(targetUrl);
    }
  }

  const handleFreePlan = () => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    } else {
      navigate('/register');
    }
  };

  const prices = {
    profesional: isAnnual ? "$48 USD" : "$60 USD",
    empresa: isAnnual ? "$136 USD" : "$170 USD",
    corporativo: isAnnual ? "$400 USD" : "$500 USD",
  };

  return (
    <PricingPageLayout
      
      isRevealed={isRevealed}
      isAnnual={isAnnual}
      setIsAnnual={setIsAnnual}
      prices={prices}
      handleFreePlan={handleFreePlan}
      handlePaidPlan={handlePaidPlan}
    />
  );
};
