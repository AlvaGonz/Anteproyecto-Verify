namespace Application.Common.Errors;

public static class TwoFactorErrorCode
{
    public const string EnrollmentBeginFailed = "ENROLLMENT_BEGIN_FAILED";
    public const string EnrollmentAlreadyActive = "ENROLLMENT_ALREADY_ACTIVE";
    public const string EnrollmentConfirmFailed = "ENROLLMENT_CONFIRM_FAILED";
    public const string NoPendingEnrollment = "NO_PENDING_ENROLLMENT";
    public const string TotpInvalidCode = "TOTP_INVALID_CODE";
    public const string TotpLockedOut = "TOTP_LOCKED_OUT";
    public const string RecoveryCodeInvalid = "RECOVERY_CODE_INVALID";
    public const string RecoveryCodeLockedOut = "RECOVERY_CODE_LOCKED_OUT";
    public const string EmailOtpRequestFailed = "EMAIL_OTP_REQUEST_FAILED";
    public const string EmailOtpInvalid = "EMAIL_OTP_INVALID";
    public const string EmailOtpLockedOut = "EMAIL_OTP_LOCKED_OUT";
    public const string EmailOtpResendThrottled = "EMAIL_OTP_RESEND_THROTTLED";
    public const string DisableFailed = "DISABLE_FAILED";
    public const string StatusLoadFailed = "STATUS_LOAD_FAILED";
    public const string Unknown = "UNKNOWN";
}
