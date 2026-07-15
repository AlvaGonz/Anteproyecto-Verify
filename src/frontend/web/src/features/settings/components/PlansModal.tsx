import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BillingToggle } from "../../pricing/components/BillingToggle";
import { PricingCards } from "../../pricing/components/PricingCards";
import { useAuth } from "../../../shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../pricing/pages/PricingPage.module.css";

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
  currentPlan?: string | null;
}

export const PlansModal: React.FC<PlansModalProps> = ({ isOpen, onClose, source, currentPlan }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsRevealed(true), 50);
      return () => clearTimeout(timer);
    } else {
      // Use setTimeout to avoid setting state during render
      const timer = setTimeout(() => setIsRevealed(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePaidPlan = (plan: 'profesional' | 'empresa' | 'corporativo') => {
    const billing = isAnnual ? 'yearly' : 'monthly';
    const activeSource = source || 'settings';
    const targetUrl = `/checkout?plan=${plan}&billing=${billing}&source=${activeSource}`;
    if (!isAuthenticated) {
      navigate(`/register?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      navigate(targetUrl);
    }
  }

  const handleFreePlan = () => {
    onClose();
  };

  const prices = {
    profesional: isAnnual ? "$48 USD" : "$60 USD",
    empresa: isAnnual ? "$136 USD" : "$170 USD",
    corporativo: isAnnual ? "$400 USD" : "$500 USD",
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={onClose}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#f0ece5] rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Content Area */}
            <div className="p-4 md:p-8 overflow-y-auto max-h-[80vh] flex flex-col items-center">
              
              <div className="mb-6 md:mb-10 w-full flex justify-center mt-2 md:mt-4">
                <BillingToggle
                  t={t}
                  isRevealed={isRevealed}
                  isAnnual={isAnnual}
                  setIsAnnual={setIsAnnual}
                />
              </div>
              
              <div className="w-full">
                <PricingCards
                  t={t}
                  isRevealed={isRevealed}
                  prices={prices}
                  handleFreePlan={handleFreePlan}
                  handlePaidPlan={handlePaidPlan}
                  modalMode={true}
                  currentPlan={currentPlan}
                />
              </div>
            </div>
            
            {/* Fixed Footer with Cancel button */}
            <div className="px-8 py-5 border-t border-border flex justify-start bg-white shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="vf-btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
