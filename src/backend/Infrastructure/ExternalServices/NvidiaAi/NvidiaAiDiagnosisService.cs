namespace Infrastructure.ExternalServices.NvidiaAi;

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.DocumentIntelligence;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public class NvidiaAiDiagnosisService : IAiDiagnosisService
{
    private readonly HttpClient _httpClient;
    private readonly NvidiaAiOptions _options;
    private readonly ILogger<NvidiaAiDiagnosisService> _logger;

    public NvidiaAiDiagnosisService(
        IHttpClientFactory httpClientFactory,
        IOptions<NvidiaAiOptions> options,
        ILogger<NvidiaAiDiagnosisService> logger)
    {
        _options = options.Value;
        _httpClient = httpClientFactory.CreateClient("nvidia-nim");
        _logger = logger;
    }

    public async Task<AiDiagnosisResult> GenerateDiagnosisAsync(
        Guid projectId,
        IReadOnlyList<DocumentContext> documents,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("NVIDIA API key is not configured. Returning fallback AI diagnosis.");
            return new AiDiagnosisResult(
                Score: 0,
                Summary: "Servicio de IA no disponible",
                MissingDocuments: Array.Empty<string>(),
                Recommendations: new[] { "Configure la API key de NVIDIA NIM para habilitar el diagnóstico por IA." }
            );
        }

        try
        {
            var systemPrompt = @"Eres un asistente de Inteligencia Artificial experto en la verificación formal y legal de documentos para el Registro Inmobiliario (RI) de la República Dominicana.
Tu tarea es diagnosticar el expediente de un proyecto de construcción/titulación en base a una lista de documentos que han sido cargados.
Debes analizar la lista proporcionada por el usuario y evaluar:
1. Puntuación general de integridad (Score del 0 al 100):
   - Un expediente con 0 documentos válidos debe tener 0.
   - La presencia de documentos obligatorios como 'CertificadoTitulo', 'PlanosArquitectonicos' y 'PermisoConstruccion' con estado 'Valid' aumenta significativamente la puntuación.
   - Documentos con estado 'Invalid' o faltantes penalizan la puntuación.
2. Identificar documentos obligatorios faltantes.
3. Generar recomendaciones claras para el usuario en español.

Debes retornar ÚNICAMENTE un objeto JSON estructurado exactamente con el siguiente formato, sin bloques de código markdown ni texto adicional:
{
  ""score"": 75,
  ""summary"": ""Resumen profesional del estado del expediente aquí..."",
  ""missingDocuments"": [""TipoDocumentoFaltante1"", ""TipoDocumentoFaltante2""],
  ""recommendations"": [""Subir el plano catastral firmado."", ""Corregir el permiso de construcción vencido.""]
}";

            var userPromptBuilder = new StringBuilder();
            userPromptBuilder.AppendLine($"Proyecto ID: {projectId}");
            userPromptBuilder.AppendLine("Documentos cargados:");
            foreach (var doc in documents)
            {
                userPromptBuilder.AppendLine($"- Tipo: {doc.Type}, Estado: {doc.Status}, Observaciones/OCR: {doc.OcrSummary ?? "Ninguna"}, Fecha Carga: {doc.UploadedAt:yyyy-MM-dd}");
            }
            userPromptBuilder.AppendLine("\nPor favor, genera el diagnóstico JSON para este expediente.");

            var requestBody = new
            {
                model = _options.Model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPromptBuilder.ToString() }
                },
                temperature = 0.2,
                max_tokens = 1024,
                stream = false
            };

            var requestJson = JsonSerializer.Serialize(requestBody);
            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.BaseUrl.TrimEnd('/')}/chat/completions");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            // Auth header is added in HttpClient registration but we also ensure it here to be safe
            if (request.Headers.Authorization == null)
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
            }

            _logger.LogInformation("Sending chat completion request to NVIDIA NIM API for project {ProjectId} using model {Model}.", projectId, _options.Model);
            
            var response = await _httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("NVIDIA NIM API returned error status {StatusCode}. Details: {Details}", response.StatusCode, errorContent);
                return CreateFallbackResult("Servicio de IA no disponible");
            }

            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
            using var document = JsonDocument.Parse(responseJson);
            var choice = document.RootElement.GetProperty("choices")[0];
            var messageContent = choice.GetProperty("message").GetProperty("content").GetString() ?? string.Empty;

            var cleanJson = CleanMarkdownCodeFences(messageContent);
            
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsedResult = JsonSerializer.Deserialize<AiDiagnosisResultJson>(cleanJson, options);
                
                if (parsedResult != null)
                {
                    return new AiDiagnosisResult(
                        Score: parsedResult.Score,
                        Summary: parsedResult.Summary ?? string.Empty,
                        MissingDocuments: parsedResult.MissingDocuments ?? new List<string>(),
                        Recommendations: parsedResult.Recommendations ?? new List<string>()
                    );
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse JSON response from NVIDIA NIM. Raw content: {Content}", messageContent);
            }

            return CreateFallbackResult("Servicio de IA no disponible");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while communicating with NVIDIA NIM API for project {ProjectId}.", projectId);
            return CreateFallbackResult("Servicio de IA no disponible");
        }
    }

    private static string CleanMarkdownCodeFences(string text)
    {
        var clean = text.Trim();
        if (clean.StartsWith("```json"))
        {
            clean = clean.Substring(7);
        }
        else if (clean.StartsWith("```"))
        {
            clean = clean.Substring(3);
        }

        if (clean.EndsWith("```"))
        {
            clean = clean.Substring(0, clean.Length - 3);
        }

        return clean.Trim();
    }

    private static AiDiagnosisResult CreateFallbackResult(string summary)
    {
        return new AiDiagnosisResult(
            Score: 0,
            Summary: summary,
            MissingDocuments: Array.Empty<string>(),
            Recommendations: new[] { "Servicio de diagnóstico temporalmente fuera de línea. Por favor, reintente más tarde." }
        );
    }

    private class AiDiagnosisResultJson
    {
        public int Score { get; set; }
        public string? Summary { get; set; }
        public List<string>? MissingDocuments { get; set; }
        public List<string>? Recommendations { get; set; }
    }
}
