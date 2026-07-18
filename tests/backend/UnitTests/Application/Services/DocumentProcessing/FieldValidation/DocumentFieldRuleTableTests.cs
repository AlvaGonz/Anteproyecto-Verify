using System.Linq;
using Application.Services.DocumentProcessing.FieldValidation;
using Domain.Enums;
using Xunit;

namespace UnitTests.Application.Services.DocumentProcessing.FieldValidation;

public class DocumentFieldRuleTableTests
{
    [Fact]
    public void GetRulesForDocumentType_ValidType_ReturnsRules()
    {
        // Act
        var rules = DocumentFieldRuleTable.GetRulesForDocumentType(DocumentType.TITLE);

        // Assert
        Assert.NotNull(rules);
        Assert.NotEmpty(rules);
        Assert.Contains(rules, r => r.Campo == "matricula_serial" && r.Obligatorio);
        Assert.Contains(rules, r => r.Campo == "area" && !r.Obligatorio);
    }

    [Fact]
    public void GetRulesForDocumentType_InvalidType_ReturnsEmpty()
    {
        // Act
        var rules = DocumentFieldRuleTable.GetRulesForDocumentType(DocumentType.OTHER);

        // Assert
        Assert.NotNull(rules);
        Assert.Empty(rules);
    }

    [Fact]
    public void CrossCuttingRules_ContainsExpectedFields()
    {
        // Act
        var rules = DocumentFieldRuleTable.CrossCuttingRules;

        // Assert
        Assert.NotNull(rules);
        Assert.NotEmpty(rules);
        Assert.Contains(rules, r => r.Campo == "nivel_legibilidad");
        Assert.Contains(rules, r => r.Campo == "alertas_enmienda_tachadura_alteracion");
    }

    [Fact]
    public void SupportedDocumentTypes_ContainsRequiredTypes()
    {
        // Act
        var types = DocumentFieldRuleTable.SupportedDocumentTypes;

        // Assert
        Assert.Contains(DocumentType.TITLE, types);
        Assert.Contains(DocumentType.LEGAL_STATUS, types);
        Assert.Contains(DocumentType.SURVEY, types);
        Assert.Contains(DocumentType.ID, types);
        Assert.Contains(DocumentType.NOTARIAL_POWER, types);
    }
}
