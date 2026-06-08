import React from "react";
import { RegisterForm } from "../../features/auth/components/RegisterForm";

export const RegisterPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#F4F1EC] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-premium w-full max-w-sm flex justify-center">
        <RegisterForm />
      </div>
    </main>
  );
};
