namespace Application.DTOs.Public;

using System;

public record PublicProjectVerificationDto(
    string PublicCode,
    string ProjectName,
    string PublicLocation,
    string PublicProjectStatus,
    string IntegrityStatus,
    string VerificationMessage,
    DateTime? LastVerifiedUtc,
    bool IsVerifiable,
    string Summary
);
