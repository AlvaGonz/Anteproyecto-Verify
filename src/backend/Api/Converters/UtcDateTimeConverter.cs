namespace Api.Converters;

using System;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

/// <summary>
/// ponytail: SQL Server datetime2 strips DateTime.Kind on EF Core read.
/// Without this converter, System.Text.Json serializes Unspecified dates
/// without the 'Z' suffix, causing JS to treat them as local time.
/// 
/// This forces all DateTime serialization to UTC with 'Z', and parses
/// incoming dates without timezone info as UTC.
/// </summary>
public sealed class UtcDateTimeConverter : JsonConverter<DateTime>
{
    private const string Format = "yyyy-MM-ddTHH:mm:ssZ";

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var str = reader.GetString();
        if (string.IsNullOrEmpty(str))
            return default;

        // If it already has timezone info, parse normally
        if (str.EndsWith('Z') || str.Contains('+') || str.IndexOf('-', 10) >= 0)
        {
            if (DateTime.TryParse(str, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal, out var result))
                return result;
        }

        // No timezone info → assume UTC (matches our DateTime.UtcNow convention)
        if (DateTime.TryParse(str, CultureInfo.InvariantCulture, DateTimeStyles.None, out var local))
            return DateTime.SpecifyKind(local, DateTimeKind.Utc);

        return default;
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Ensure Kind is UTC before serializing
        var utc = value.Kind == DateTimeKind.Utc ? value
            : value.Kind == DateTimeKind.Local ? value.ToUniversalTime()
            : DateTime.SpecifyKind(value, DateTimeKind.Utc);

        writer.WriteStringValue(utc.ToString(Format, CultureInfo.InvariantCulture));
    }
}
