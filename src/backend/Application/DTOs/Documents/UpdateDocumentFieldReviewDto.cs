namespace Application.DTOs.Documents;

using Domain.Enums;

public record UpdateDocumentFieldReviewDto(OcrFieldReviewState ReviewState, string? CorrectedValue);
