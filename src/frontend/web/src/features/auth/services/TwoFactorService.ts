import { apiClient } from "../../../infrastructure/api/client";

export interface TwoFactorStatus {
  enabled: boolean;
  hasRecoveryCodes: boolean;
}

export interface EnrollmentBegin {
  secret: string;
  otpAuthUri: string;
}

export interface EnrollmentConfirm {
  recoveryCodes: string[];
}

export interface TwoFactorChallenge {
  challengeToken: string;
  emailMasked: string;
}

export type TwoFactorError =
  | { _tag: "InvalidCode"; message: string }
  | { _tag: "LockedOut"; message: string }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "UnknownError"; message: string; original?: unknown };

export const TwoFactorService = {
  async getStatus(): Promise<TwoFactorStatus> {
    const { data } = await apiClient.get<TwoFactorStatus>("/auth/2fa/status");
    return data;
  },

  async beginEnrollment(): Promise<EnrollmentBegin> {
    const { data } = await apiClient.post<EnrollmentBegin>("/auth/2fa/enrollment/begin");
    return data;
  },

  async confirmEnrollment(code: string): Promise<EnrollmentConfirm> {
    const { data } = await apiClient.post<EnrollmentConfirm>("/auth/2fa/enrollment/confirm", { code: Number(code) });
    return data;
  },

  async verifyChallenge(challengeToken: string, code: string): Promise<void> {
    await apiClient.post("/auth/2fa/verify", { challengeToken, code: Number(code) });
  },

  async requestEmailOtp(challengeToken: string): Promise<void> {
    await apiClient.post("/auth/2fa/email-otp/request", { challengeToken });
  },

  async verifyEmailOtp(challengeToken: string, otp: string): Promise<void> {
    await apiClient.post("/auth/2fa/email-otp/verify", { challengeToken, otp });
  },

  async consumeRecoveryCode(challengeToken: string, code: string): Promise<void> {
    await apiClient.post("/auth/2fa/recovery-code", { challengeToken, recoveryCode: code });
  },

  async disable(password: string, code: string): Promise<void> {
    await apiClient.post("/auth/2fa/disable", { password, code: Number(code) });
  },
};
