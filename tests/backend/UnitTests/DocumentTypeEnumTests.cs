using Domain.Enums;
using Domain.Policies;
using Xunit;
using FluentAssertions;

namespace UnitTests
{
    public class DocumentTypeEnumTests
    {
        [Fact]
        public void CertificadoEIA_ShouldExist_WithValue29()
        {
            var eiaType = Enum.Parse<DocumentType>("CertificadoEIA");
            ((int)eiaType).Should().Be(29);
        }

        [Fact]
        public void CertificadoUsoSuelo_ShouldHaveValue6()
        {
            ((int)DocumentType.CertificadoUsoSuelo).Should().Be(6);
        }

        [Fact]
        public void RegistroMercantil_ShouldHaveValue9()
        {
            ((int)DocumentType.RegistroMercantil).Should().Be(9);
        }

        [Fact]
        public void RNC_ShouldHaveValue12()
        {
            ((int)DocumentType.RNC).Should().Be(12);
        }

        [Fact]
        public void AllFourNewDocumentTypes_ShouldBeInRequiredDocumentsPolicy()
        {
            var docs = RequiredDocumentsPolicy.GetRequiredDocumentsForCategory(1);

            docs.Should().Contain(DocumentType.CertificadoUsoSuelo);
            docs.Should().Contain(DocumentType.RegistroMercantil);
            docs.Should().Contain(DocumentType.PoderNotarial);
            docs.Should().Contain(DocumentType.RNC);
            docs.Should().Contain(DocumentType.CertificadoEIA);
        }
    }
}
