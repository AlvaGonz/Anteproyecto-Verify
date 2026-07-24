using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Contracts.Documents;
using Application.Documents.Extractions;
using Application.DTOs.Documents;
using Application.Features.Documents.GetDocumentDiagnosis;
using Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using Xunit;

namespace Api.Tests.Projects
{
    public class ProjectDocumentsControllerShapingTests
    {
        [Fact]
        public async Task GetProjectDocuments_ShouldMapEstadoJuridicoExtraction_FromCanonicalDataJson()
        {
            // Arrange
            var mockDocumentService = Substitute.For<IDocumentService>();
            var mockDiagnosisHandler = Substitute.For<GetDocumentDiagnosisQueryHandler>(null, null, null);
            var mockConfig = Substitute.For<IConfiguration>();

            var controller = new ProjectDocumentsController(
                mockDocumentService,
                mockDiagnosisHandler,
                mockConfig);

            var documentId = Guid.NewGuid();
            var projectId = Guid.NewGuid();
            var canonicalJson = @"{
                ""schemaVersion"": ""1.0"",
                ""documentType"": ""EstadoJuridico"",
                ""payload"": {
                    ""schemaVersion"": ""1.0"",
                    ""documentType"": ""EstadoJuridico"",
                    ""extractionStatus"": 2,
                    ""matricula"": {
                        ""rawValue"": ""3000362328"",
                        ""normalizedValue"": null,
                        ""confidence"": 0.99,
                        ""status"": 0
                    },
                    ""hasActiveOppositions"": false
                }
            }";

            // Mock OcrResult in JSON format (this is how it is stored in DB)
            var ocrResultJson = $@"{{
                ""success"": true,
                ""canonicalDataJson"": {System.Text.Json.JsonSerializer.Serialize(canonicalJson)}
            }}";

            var docs = new List<DocumentDto>
            {
                new DocumentDto(
                    documentId,
                    projectId,
                    DocumentType.CertificacionEstadoJuridico,
                    "test.pdf",
                    "application/pdf",
                    ".pdf",
                    1000,
                    DocumentStatus.Verificado,
                    true,
                    1,
                    null,
                    null,
                    Guid.NewGuid(),
                    null,
                    "http://file-url",
                    DateTime.UtcNow,
                    null,
                    ocrResultJson
                )
            };

            mockDocumentService.GetProjectDocumentsAsync(projectId)
                .Returns(Task.FromResult((IEnumerable<DocumentDto>)docs));

            // Act
            var result = await controller.GetProjectDocuments(projectId) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            var returnedDocs = result!.Value as IEnumerable<ValidationDocumentDto>;
            Assert.NotNull(returnedDocs);
            var doc = returnedDocs!.First();

            Assert.NotNull(doc.EstadoJuridicoExtraction);
            Assert.Equal("3000362328", doc.EstadoJuridicoExtraction!.Matricula.RawValue);
            Assert.False(doc.EstadoJuridicoExtraction.HasActiveOppositions);
            Assert.Equal("EstadoJuridico", doc.EstadoJuridicoExtraction.DocumentType);
            Assert.Equal((ExtractionStatus)2, doc.EstadoJuridicoExtraction.ExtractionStatus);
        }
    }
}
