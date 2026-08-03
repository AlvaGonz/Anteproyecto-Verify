import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChallengeScreen } from "../ChallengeScreen";
import { TwoFactorService } from "../../services/TwoFactorService";
import { useAuth } from "../../../../shared/context/AuthContext";

vi.mock("../../../../shared/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../services/TwoFactorService", () => ({
  TwoFactorService: {
    requestEmailOtp: vi.fn(),
    verifyEmailOtp: vi.fn(),
    verifyChallenge: vi.fn(),
    consumeRecoveryCode: vi.fn(),
    getStatus: vi.fn(),
    beginEnrollment: vi.fn(),
    confirmEnrollment: vi.fn(),
    disable: vi.fn(),
  },
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  const React = await import("react");
  const passthrough =
    (tag: string) =>
    ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement(tag, props, children);
  return {
    ...(actual as object),
    motion: { div: passthrough("div") },
    m: { div: passthrough("div") },
  };
});

const requestEmailOtpMock = vi.mocked(TwoFactorService.requestEmailOtp);
const verifyEmailOtpMock = vi.mocked(TwoFactorService.verifyEmailOtp);

const FORBIDDEN_INTERNALS_REGEX =
  /resend|provider|sdk|exception|\bstack\b|\bef\b|sql|\b500\b|EMAIL_OTP/i;

describe("ChallengeScreen — Usar código por correo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pendingChallenge: {
        challengeToken: "ch-test-tok",
        emailMasked: "e***@example.com",
      },
      clearChallenge: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it("clicking the button fires TwoFactorService.requestEmailOtp with the challenge token", async () => {
    requestEmailOtpMock.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<ChallengeScreen />);

    const btn = screen.getByRole("button", {
      name: /usar código por correo/i,
    });
    await user.click(btn);

    await waitFor(() => {
      expect(requestEmailOtpMock).toHaveBeenCalledTimes(1);
    });
    expect(requestEmailOtpMock).toHaveBeenCalledWith("ch-test-tok");
  });

  it("on success, renders the safe 'Código enviado a …' info banner (no internal text)", async () => {
    requestEmailOtpMock.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<ChallengeScreen />);

    await user.click(
      screen.getByRole("button", { name: /usar código por correo/i }),
    );

    const info = await screen.findByText(/Código enviado a e\*\*\*@example\.com/i);
    expect(info).toBeTruthy();

    // No alert on success
    expect(screen.queryByRole("alert")).toBeNull();

    // The success-state UI is the email-mode input form.
    const codeInput = screen.getByPlaceholderText("000000");
    expect(codeInput).toBeTruthy();
  });

  it("on failure, renders the safe catalogued error in an alert — never raw axios nor backend ErrorCode", async () => {
    const axiosLikeError: unknown = {
      response: {
        status: 400,
        data: {
          succeeded: false,
          code: "EMAIL_OTP_REQUEST_FAILED",
          message:
            "No se pudo enviar el código por correo. Intente nuevamente en unos minutos.",
        },
      },
      message: "Request failed with status code 400",
    };
    requestEmailOtpMock.mockRejectedValueOnce(axiosLikeError);

    const user = userEvent.setup();
    render(<ChallengeScreen />);

    await user.click(
      screen.getByRole("button", { name: /usar código por correo/i }),
    );

    const alert = await screen.findByRole("alert");
    const alertText = alert.textContent ?? "";
    expect(alertText).toMatch(
      /no se pudo enviar el código por correo|intente nuevamente/i,
    );
    expect(
      alertText,
      `UI leaked internal detail: '${alertText}'`,
    ).not.toMatch(FORBIDDEN_INTERNALS_REGEX);
  });

  it("never renders the literal string 'error' even when an error is shown (regression for {\"error\"} bug)", async () => {
    requestEmailOtpMock.mockRejectedValueOnce({
      response: { status: 400, data: { code: "EMAIL_OTP_REQUEST_FAILED" } },
      message: "Request failed",
    });

    const user = userEvent.setup();
    render(<ChallengeScreen />);

    await user.click(
      screen.getByRole("button", { name: /usar código por correo/i }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert.textContent?.trim()).not.toBe("error");
    expect(alert.textContent?.trim()).not.toBe('"error"');
    expect(alert.textContent).toMatch(/código|intente|nuevamente|enviar/i);
  });
});
