import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnrollmentWizard } from "../EnrollmentWizard";

vi.mock("../../../auth/services/TwoFactorService", () => ({
  TwoFactorService: {
    beginEnrollment: vi.fn(),
    confirmEnrollment: vi.fn(),
  },
}));

vi.mock("../../../../shared/components/ui/Toast/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn() }),
}));

import { TwoFactorService } from "../../../auth/services/TwoFactorService";
const beginEnrollment = vi.mocked(TwoFactorService.beginEnrollment);
const confirmEnrollment = vi.mocked(TwoFactorService.confirmEnrollment);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("EnrollmentWizard — QR + safe errors", () => {
  it("renders the QR code from otpAuthUri after beginEnrollment", async () => {
    beginEnrollment.mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpAuthUri: "otpauth://totp/VeriFinca:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=VeriFinca",
    });

    render(<EnrollmentWizard />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /activar verificación/i }));

    const qr = await screen.findByTestId("qr-code");
    expect(qr).toBeInTheDocument();

    await waitFor(() => {
      expect(qr.querySelector("svg")).toBeInTheDocument();
    });
  });

  it("keeps the manual secret copy fallback visible alongside the QR", async () => {
    beginEnrollment.mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpAuthUri: "otpauth://totp/VeriFinca:test@example.com?secret=JBSWY3DPEHPK3PXP",
    });

    render(<EnrollmentWizard />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /activar verificación/i }));

    const secretInput = await screen.findByTestId("enroll-secret");
    expect(secretInput).toHaveValue("JBSWY3DPEHPK3PXP");

    expect(screen.getByRole("button", { name: /copiar clave/i })).toBeInTheDocument();
  });

  it("confirms enrollment with a valid 6-digit code and shows recovery codes exactly once", async () => {
    beginEnrollment.mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpAuthUri: "otpauth://totp/VeriFinca:t@e.com?secret=JBSWY3DPEHPK3PXP",
    });
    confirmEnrollment.mockResolvedValueOnce({
      recoveryCodes: ["AAAA-BBBB", "CCCC-DDDD", "EEEE-FFFF", "GGGG-HHHH", "IIII-JJJJ", "KKKK-LLLL", "MMMM-NNNN", "OOOO-PPPP", "QQQQ-RRRR", "SSSS-TTTT"],
    });

    render(<EnrollmentWizard onCompleted={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /activar verificación/i }));

    const codeInput = await screen.findByTestId("enroll-code-input");
    await user.type(codeInput, "123456");
    await user.click(screen.getByRole("button", { name: /^confirmar$/i }));

    const codesList = await screen.findByTestId("recovery-codes-list");
    expect(codesList.querySelectorAll("code")).toHaveLength(10);

    expect(screen.queryByTestId("enroll-code-input")).not.toBeInTheDocument();
  });

  it("shows the standardized SAFE message when backend returns 423 (lockout), NOT backend text", async () => {
    beginEnrollment.mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpAuthUri: "otpauth://totp/VeriFinca:t@e.com?secret=JBSWY3DPEHPK3PXP",
    });
    confirmEnrollment.mockRejectedValueOnce({
      response: {
        status: 423,
        data: {
          code: "TOTP_LOCKED_OUT",
          message: "SqlException: too many failed login attempts for user_id=0xBAD",
          correlationId: "trace-xyz",
        },
      },
      message: "should not appear",
    });

    render(<EnrollmentWizard />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /activar verificación/i }));
    const codeInput = await screen.findByTestId("enroll-code-input");
    await user.type(codeInput, "111111");
    await user.click(screen.getByRole("button", { name: /^confirmar$/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/demasiados intentos/i);
    expect(alert).not.toHaveTextContent(/SqlException|0xBAD|trace-xyz|user_id/);
  });

  it("shows standardized SAFE message for invalid TOTP, hides raw backend text", async () => {
    beginEnrollment.mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpAuthUri: "otpauth://totp/VeriFinca:t@e.com?secret=JBSWY3DPEHPK3PXP",
    });
    confirmEnrollment.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          code: "TOTP_INVALID_CODE",
          message: "The INSERT statement conflicted with the FOREIGN KEY constraint 'FK_User'",
        },
      },
      message: "should not appear",
    });

    render(<EnrollmentWizard />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /activar verificación/i }));
    const codeInput = await screen.findByTestId("enroll-code-input");
    await user.type(codeInput, "111111");
    await user.click(screen.getByRole("button", { name: /^confirmar$/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/código inválido o vencido/i);
    expect(alert).not.toHaveTextContent(/INSERT|FOREIGN|constraint|FK_/);
  });

  it("shows standardized SAFE message for unknown backend error, hides exception text", async () => {
    beginEnrollment.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          detail: "System.NullReferenceException: Object reference not set at Api.Controllers.TwoFactorController line 47",
        },
      },
      message: "Internal stack trace here",
    });

    render(<EnrollmentWizard />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /activar verificación/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/no se pudo (completar|iniciar)/i);
    expect(alert).not.toHaveTextContent(/NullReferenceException|stack|TwoFactorController|line 47/);
  });

  it("QR render failure keeps the manual secret copy fallback usable", async () => {
    beginEnrollment.mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpAuthUri: "otpauth://totp/VeriFinca:t@e.com?secret=JBSWY3DPEHPK3PXP",
    });

    render(<EnrollmentWizard />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /activar verificación/i }));

    await waitFor(() => {
      expect(screen.getByTestId("enroll-secret")).toHaveValue("JBSWY3DPEHPK3PXP");
    });
    expect(screen.getByRole("button", { name: /copiar clave/i })).toBeEnabled();
  });
});
