using System.Collections.Generic;
using Application.Services.DocumentProcessing.FieldValidation;
using Domain.Enums;
using Infrastructure.DocumentProcessing;
using Xunit;

namespace UnitTests.Infrastructure.DocumentProcessing;

public class DocumentValidationRuleEngineTests
{
    private readonly DocumentValidationRuleEngine _sut;
    private readonly IReadOnlyList<DocumentFieldRule> _rules;

    public DocumentValidationRuleEngineTests()
    {
        _sut = new DocumentValidationRuleEngine();
        _rules = DocumentFieldRuleTable.GetRulesForDocumentType(DocumentType.TITLE);
    }

    [Fact]
    public void Validate_AllMandatoryFieldsPresentWithHighConfidence_ReturnsVerificado()
    {
        // Arrange
        var fields = new Dictionary<string, ExtractedField>
        {
            { "matricula_serial", new ExtractedField("123", 0.9, true) },
            { "titular", new ExtractedField("Juan", 0.9, true) },
            { "descripcion_inmueble", new ExtractedField("Apto", 0.9, true) },
            { "ubicacion_catastral", new ExtractedField("Sto Dgo", 0.9, true) },
            { "fecha", new ExtractedField("10/10/2023", 0.9, true) },
            { "entidad_emisora", new ExtractedField("RI", 0.9, true) }
        };

        // Act
        var result = _sut.Validate(fields, _rules);

        // Assert
        Assert.Equal("Verificado", result.EstadoResultante);
        Assert.Empty(result.CamposFaltantesObligatorios);
        Assert.Empty(result.AlertasIntegridad);
        Assert.True(result.ConfianzaPromedio >= 0.9);
    }

    [Fact]
    public void Validate_MissingMandatoryField_ReturnsObservadoAndListsMissingField()
    {
        // Arrange
        var fields = new Dictionary<string, ExtractedField>
        {
            { "titular", new ExtractedField("Juan", 0.9, true) },
            { "descripcion_inmueble", new ExtractedField("Apto", 0.9, true) },
            { "ubicacion_catastral", new ExtractedField("Sto Dgo", 0.9, true) },
            { "fecha", new ExtractedField("10/10/2023", 0.9, true) },
            { "entidad_emisora", new ExtractedField("RI", 0.9, true) }
        };
        // matricula_serial is missing

        // Act
        var result = _sut.Validate(fields, _rules);

        // Assert
        Assert.Equal("Observado", result.EstadoResultante);
        Assert.Contains("matricula_serial", result.CamposFaltantesObligatorios);
    }

    [Fact]
    public void Validate_IntegrityAlertPresent_ForcesObservadoRegardlessOfFields()
    {
        // Arrange
        var fields = new Dictionary<string, ExtractedField>
        {
            { "matricula_serial", new ExtractedField("123", 0.9, true) },
            { "titular", new ExtractedField("Juan", 0.9, true) },
            { "descripcion_inmueble", new ExtractedField("Apto", 0.9, true) },
            { "ubicacion_catastral", new ExtractedField("Sto Dgo", 0.9, true) },
            { "fecha", new ExtractedField("10/10/2023", 0.9, true) },
            { "entidad_emisora", new ExtractedField("RI", 0.9, true) },
            { "alertas_enmienda_tachadura_alteracion", new ExtractedField("Tachadura", 1.0, true) }
        };

        // Act
        // Make sure we pass the cross-cutting rule that checks for the alert
        var allRules = new List<DocumentFieldRule>(_rules);
        allRules.AddRange(DocumentFieldRuleTable.CrossCuttingRules);
        
        var result = _sut.Validate(fields, allRules);

        // Assert
        Assert.Equal("Observado", result.EstadoResultante);
        Assert.NotEmpty(result.AlertasIntegridad);
        Assert.Contains(result.AlertasIntegridad, a => a.Contains("alteración") || a.Contains("tachadura"));
    }

    [Fact]
    public void Validate_LowLegibility_ReturnsObservado()
    {
        // Arrange
        var fields = new Dictionary<string, ExtractedField>
        {
            { "matricula_serial", new ExtractedField("123", 0.5, true) }, // Low confidence
            { "titular", new ExtractedField("Juan", 0.6, true) },
            { "descripcion_inmueble", new ExtractedField("Apto", 0.5, true) },
            { "ubicacion_catastral", new ExtractedField("Sto Dgo", 0.5, true) },
            { "fecha", new ExtractedField("10/10/2023", 0.5, true) },
            { "entidad_emisora", new ExtractedField("RI", 0.5, true) }
        };

        // Act
        var result = _sut.Validate(fields, _rules, 0.80);

        // Assert
        Assert.Equal("Observado", result.EstadoResultante);
        Assert.True(result.ConfianzaPromedio < 0.80);
    }
}
