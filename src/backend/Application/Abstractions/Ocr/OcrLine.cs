namespace Application.Abstractions.Ocr;

using System;

public record OcrBoundingBox
{
    public double Left { get; init; }
    public double Top { get; init; }
    public double Right { get; init; }
    public double Bottom { get; init; }
    public double CenterX => (Left + Right) / 2.0;
    public double CenterY => (Top + Bottom) / 2.0;
    public double Width => Math.Max(0, Right - Left);
    public double Height => Math.Max(0, Bottom - Top);
    public int PageIndex { get; init; } = 0;
}

public record OcrLine
{
    public string Text { get; init; } = string.Empty;
    public double Confidence { get; init; }
    public OcrBoundingBox? BoundingBox { get; init; }
}

