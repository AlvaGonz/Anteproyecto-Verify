using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using Tests.Integration.Helpers;
using Application.DTOs;
using Application.DTOs.Projects;
using Application.DTOs.Documents;
using Domain.Enums;

namespace Tests.Integration.Projects;

public class ProjectDocumentsSecurityApiTests : IntegrationTestBase
{
    public ProjectDocumentsSecurityApiTests(VeriFincaWebFactory factory) : base(factory)
    {
    }

    // Explicit Coverage:
    // 1. GET /api/projects/{projectId}/documents
    // 2. POST /api/v1/projects/{projectId}/documents/requirements/MENSURA/upload
    // We confirm these are the EXACT endpoint shapes used by the Validation Center UI 
    // to upload and render the document list and extraction details.
    [Fact]
    public async Task GetProjectDocuments_ShouldNotExposeRawOcrData()
    {
        // 1. Arrange - Register and Login
        var (token, userId) = await RegisterAndLoginAsync("Corporativo");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 2. Create a project
        var projectResponse = await _client.PostAsJsonAsync("/api/projects", new
        {
            Nombre = "Test Project",
            UbicacionTexto = "Santo Domingo",
            UsuarioCreadorId = userId,
            CategoriaId = 16,
            DatosDesarrollador = "Developer SA",
            RncDesarrollador = "101000001"
        });

        projectResponse.EnsureSuccessStatusCode();
        var projectData = await projectResponse.Content.ReadFromJsonAsync<ProyectoDto>();
        var projectId = projectData!.Id;

        // 3. Upload a mock document for Mensura
        using var content = new MultipartFormDataContent();
        
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes("%PDF-1.4\nfake pdf content"));
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/pdf");
        
        content.Add(fileContent, "file", "test-mensura.pdf");

        var uploadResponse = await _client.PostAsync($"/api/v1/projects/{projectId}/documents/requirements/MENSURA/upload", content);
        if (!uploadResponse.IsSuccessStatusCode)
        {
            var err = await uploadResponse.Content.ReadAsStringAsync();
            throw new Exception($"Upload failed with {uploadResponse.StatusCode}: {err}");
        }

        // 4. Act - Fetch the document list which uses ValidationDocumentDto
        var getDocsResponse = await _client.GetAsync($"/api/projects/{projectId}/documents");
        getDocsResponse.EnsureSuccessStatusCode();
        
        var jsonResponse = await getDocsResponse.Content.ReadAsStringAsync();

        // 5. Assert - Ensure no sensitive raw data is leaked in the DTO structure
        // We verify that internal raw OCR properties do not exist in the response
        Assert.DoesNotContain("resultadoOcrJson", jsonResponse);
        Assert.DoesNotContain("boundingBox", jsonResponse);
        Assert.DoesNotContain("confidence_score_raw", jsonResponse);
        
        // Confirm the response uses the ValidationDocumentDto shape with safe extractions
        using var doc = JsonDocument.Parse(jsonResponse);
        var rootArray = doc.RootElement.EnumerateArray();
        
        bool foundMensura = false;
        foreach (var item in rootArray)
        {
            if (item.GetProperty("tipoDocumento").GetInt32() == (int)DocumentType.PlanoMensuraCatastral)
            {
                foundMensura = true;
                
                // Confirm it has the canonical extraction properties (even if null right now)
                Assert.True(item.TryGetProperty("planoMensuraExtraction", out var extractionProp));
                Assert.True(item.TryGetProperty("certificadoTituloExtraction", out _));
                Assert.True(item.TryGetProperty("cedulaExtraction", out _));
                
                // Ensure internal db fields are not leaked
                Assert.False(item.TryGetProperty("filePath", out _), "Internal blob paths must not be exposed.");
            }
        }
        
        Assert.True(foundMensura, "The uploaded mensura document should be in the list.");
    }
}
