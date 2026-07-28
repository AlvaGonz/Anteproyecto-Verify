using System;
using System.Collections.Generic;
using System.Linq;
using Application.Abstractions.Ocr;
using Application.Documents.Extractions;
using Xunit;
using FluentAssertions;

namespace UnitTests.Application.Documents.Extractions
{
    public class CertificadoTituloRdPaddleMapperTests
    {
        [Fact]
        public void MapFromOcrResult_ShouldExtractFieldsCorrectly_WhenLabelsArePresent()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Certificado de Título" },
                new OcrLine { Text = "Registro de Títulos de Santo Domingo" },
                new OcrLine { Text = "MATRÍCULA 0100234567" },
                new OcrLine { Text = "DESIGNACIÓN CATASTRAL 12345-67" },
                new OcrLine { Text = "FECHA Y HORA DE INSCRIPCION 15/01/2023" },
                new OcrLine { Text = "viene de 54321" },
                new OcrLine { Text = "MUNICIPIO San Pedro de Macoris" },
                new OcrLine { Text = "PROVINCIA Santo Domingo OFICINA" },
                new OcrLine { Text = "SUPERFICIE 12,130.07 m2" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            
            extraction.Oficina.RawValue.Should().Be("de Santo Domingo");
            extraction.Matricula.NormalizedValue.Should().Be("0100234567");
            extraction.DesignacionCatastral.NormalizedValue.Should().Be("12345-67");
            extraction.FechaYHoraInscripcion.RawValue.Should().Be("DE INSCRIPCION 15/01/2023");
            extraction.VieneDe.RawValue.Should().Be("54321");
            extraction.Municipio.RawValue.Should().Be("San Pedro de Macoris");
            extraction.Provincia.RawValue.Should().Be("Santo Domingo OFICINA");
            extraction.SuperficieM2.NormalizedValue.Should().Be("12130.07");
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractSuperficie_WhenLabelPrecedesValue()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Certificado de Título" },
                new OcrLine { Text = "Registro de Títulos de Santo Domingo" },
                new OcrLine { Text = "MATRICULA No. 3000123456" },
                new OcrLine { Text = "DESIGNACIÓN CATASTRAL 12345-67" },
                new OcrLine { Text = "FECHA Y HORA DE INSCRIPCION 15/01/2023" },
                new OcrLine { Text = "viene de 54321" },
                new OcrLine { Text = "MUNICIPIO BocaChica" },
                new OcrLine { Text = "PROVINCIA Santo Domingo OFICINA" },
                new OcrLine { Text = "SUPERFICIE EN METROS CUADRADOS 12,130.0700" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Completed);
            extraction.Matricula.NormalizedValue.Should().Be("3000123456");
            extraction.SuperficieM2.NormalizedValue.Should().Be("12130.0700");
        }

        [Fact]
        public void MapFromOcrResult_ShouldMarkMissing_WhenLabelsAreNotPresent()
        {
            // Arrange
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "Certificado de Título" },
                new OcrLine { Text = "No useful info here" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert
            extraction.Should().NotBeNull();
            extraction!.ExtractionStatus.Should().Be(ExtractionStatus.Incomplete);
            
            extraction.Oficina.Status.Should().Be(FieldStatus.Missing);
            extraction.DesignacionCatastral.Status.Should().Be(FieldStatus.Missing);
            extraction.FechaYHoraInscripcion.Status.Should().Be(FieldStatus.Missing);
            extraction.VieneDe.Status.Should().Be(FieldStatus.Missing);
            extraction.Municipio.Status.Should().Be(FieldStatus.Missing);
            extraction.Provincia.Status.Should().Be(FieldStatus.Missing);
            extraction.SuperficieM2.Status.Should().Be(FieldStatus.Missing);
            extraction.Matricula.Status.Should().Be(FieldStatus.Missing);
        }

        [Fact]
        public void MapFromOcrResult_ShouldExtractFromRealOcrOutput_TituloPropiedadA2()
        {
            // Arrange - Real OCR output from "Título de Propiedad A2.pdf" 
            var realOcrText = @"3758 CONSIA SNMIAEAAOTATDA 146 VEIUTICARLAS LDOCUMENTOA CONTRALEZ REGISTRO DE TITULOS 22/020142-30:00PM 1H JURISDICCION INMOBILIARIA MINEPO Distrito Nacanal POOIER.UCICIALREPUELICADOMNICANA Do Nacil EGISTRO DETLOS DEL DISTRITO NACIONAL UFFEMEEV METADCUAHA 168.00. SIMANZ1548DC01APARTAMENTO.NA-3TERCERA.PLANTA E vidud dea LeyYennombre de la Repubica se declara TITULAR DELDERECHO DE PROPiEDAD a Bominicana.mayar de edad.soltera.Cedula de ldentidad y Electoral No eSobre er inmueble andoomoAPARTAMENTONA-3.TERCERA PLANTA de condominio RESIDENCIAL GILROMA VImatricul No.0100035082con una supeicie de 168.00metrs cuadradosen elSolar 7.manzana1649.dei Distrio Catastral No.01.ubicado en e Drito Nacional.Distro Naconal.El derecho fue adquinido a mayor de edadCedula de ldentidad y Electoral No dominicano.mayor de edad.casados entre sl.Cedula de ldentidad y Electoral No. derecho bene su ongen en VENTA CON HIPOTECA.segn consta en e documento de fecha t4de luio de 2014 CONTRATOBAJO FiRMA PRIYADAlegaadc por LICDA.MARTINA DOMNGUEZ PERA.notanopublico de los de nero delDisrito Nacional.conmatricula No.2826.inscito en e lbro diario el 22 de octubre del 2014las23000PM persona debidamenterepresentada por  PEREZ.dominicana.casada.Cedula de ldentidady Electoral No. segun poder de fecha 20 de ab de 2014.egaliado par LicdaOmpia Heminia Robles Lamouth notario publico de los del nmero del Distrto Nacional.con naricula No.4051.La presente cancla laanterior ConstancAnotada rogistradaen elbro de ituls No.3619.fio166 umen0.hoja 195.Emitido el 31 de octubre dei 2014.LicdaModesta.ContresS.Registradoa de Titulos dei Disto Nacional";

            var lines = realOcrText.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => new OcrLine { Text = t })
                .ToList();

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = realOcrText
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert - These are the fields we MUST extract from real documents
            extraction.Should().NotBeNull();
            
            // Oficina: REGISTRO DE TITULOS / REGISTRO DE TITULOS DE MONSENORNOUEL
            extraction!.Oficina.Status.Should().Be(FieldStatus.Valid, "Oficina should be extracted from real OCR");
            
            // Matricula: 0100035082 (matricul No.0100035082)
            extraction.Matricula.Status.Should().Be(FieldStatus.Valid, "Matricula should be extracted from real OCR");
            extraction.Matricula.NormalizedValue.Should().Contain("0100035082");
            
            // DesignacionCatastral: Solar 7, manzana 1649, DC 01
            extraction.DesignacionCatastral.Status.Should().Be(FieldStatus.Valid, "Designacion Catastral should be extracted from real OCR");
            
            // Superficie: 168.00 m2
            extraction.SuperficieM2.Status.Should().Be(FieldStatus.Valid, "Superficie should be extracted from real OCR");
            extraction.SuperficieM2.NormalizedValue.Should().Contain("168");
            
            // Fecha: Emitido el 31 de octubre del 2014
            extraction.FechaYHoraInscripcion.Status.Should().Be(FieldStatus.Valid, "Fecha should be extracted from real OCR");
            
            // Municipio: Not explicitly in this document but Bonao/Monseñor Nouel appear in other docs
            // Provincia: 
        }

        [Fact]
        public void MapFromOcrResult_ShouldHandleNoisyOcrOutput_TituloPropiedadA()
        {
            // Arrange - Very noisy OCR from "Título de Propiedad A.pdf"
            var noisyOcrText = @"TERECACLA CONTRALIE REGISTRO DE TiTULOS JURISDICCIONINMOBILIARIA 75F190H1 PODERJUDICLFEFLEUCA DOMNCANA SANTO DOMINGODEOUMAN W.SANTODOMINGOM Rglo de Tns ca Sao Dngo 0.17m ECE ATENAIDASANTIAGOMARTIHEZ En udde la Leyy an nombre deaRepubicadedara TITULARDEL.DERECHO.DEPROPIEDAD ollerasobra el inmubia onfcado como Parcela dl DoCra Ha.1 getene unapiclo de2.17mtros.cuadradosmaca DEGUZAN.SANTODOMNGO. deecho feadquldo RIORAN5ARIO8SA drecho ene 5On SANTD DOMGO cen en VENTA.sogun cona an el documeno de fecha 06/fe2012.Aco ba fima pada lgadopor LiC PEER PAL GAO DINANna  a lo ce nmao ITOACiONALcon matric lnlas013m.c242017.RiBAN.SA(RiOisA.peona deldaenereprnad poALEANDRO GARRiGO LEFELD.e anaaDomca.Cadua delendad FEDEHCODANILOSOTOGZ.de naconadad DocaaCedula de ldendad N. WIDOE consa en Aca de Asambloa do fecha 15d2011.El preene coa el aar Cecado de Titlo encado enlpas de origonEmdoel31 dejuo del 2017 Zunda Reyde los Sano Registrador de Tllos Adsorilo Registro de Titulosde Santo Domingo 02112652 4";

            var lines = noisyOcrText.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => new OcrLine { Text = t })
                .ToList();

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = noisyOcrText
            };

            // Act
            var extraction = CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);

            // Assert - Should NOT crash and should extract what it can
            extraction.Should().NotBeNull();
            
            // At minimum, the mapper should not throw and should return an extraction object
            extraction!.ExtractionStatus.Should().NotBe(ExtractionStatus.Failed);
        }
    }
}
