using System;
using System.Collections.Generic;
using System.Linq;
using Application.Abstractions.Ocr;
using Application.Documents.Extractions;

namespace TestIPIMapper
{
    class Program
    {
        static void Main()
        {
            Console.WriteLine("=== Testing CertificacionIPIRdPaddleMapper ===\n");
            
            // Test 1: Ideal case - label on one line, value on next
            TestCase1_LabelThenValue();
            
            // Test 2: Inline - label and value on same line
            TestCase2_InlineValues();
            
            // Test 3: Real RawJson format from PaddleOCR
            TestCase3_RawJsonFormat();
            
            // Test 4: Abbreviated labels (common OCR misreads)
            TestCase4_AbbreviatedLabels();
            
            Console.WriteLine("\n=== All tests completed ===");
        }
        
        static void TestCase1_LabelThenValue()
        {
            Console.WriteLine("Test 1: Label on one line, value on next (proximity)");
            
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION IPI" },
                new OcrLine { Text = "NO. DE CERTIFICACION" },
                new OcrLine { Text = "CERT-2024-001234" },
                new OcrLine { Text = "NO. INMUEBLE" },
                new OcrLine { Text = "INM-456789" },
                new OcrLine { Text = "PARCELA NO." },
                new OcrLine { Text = "3094667545124-AD" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            
            PrintExtraction(extraction);
            Console.WriteLine($"Status: {extraction.ExtractionStatus}");
            AssertField("NumeroCertificacion", "CERT-2024-001234", extraction.NumeroCertificacion);
            AssertField("NumeroInmueble", "INM-456789", extraction.NumeroInmueble);
            AssertField("ParcelaNumero", "3094667545124-AD", extraction.ParcelaNumero);
            Console.WriteLine();
        }
        
        static void TestCase2_InlineValues()
        {
            Console.WriteLine("Test 2: Label and value on same line (inline)");
            
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION IPI" },
                new OcrLine { Text = "NO. DE CERTIFICACION: CERT-2024-001234" },
                new OcrLine { Text = "NO. INMUEBLE: INM-456789" },
                new OcrLine { Text = "PARCELA NO.: 3094667545124-AD" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            
            PrintExtraction(extraction);
            Console.WriteLine($"Status: {extraction.ExtractionStatus}");
            AssertField("NumeroCertificacion", "CERT-2024-001234", extraction.NumeroCertificacion);
            AssertField("NumeroInmueble", "INM-456789", extraction.NumeroInmueble);
            AssertField("ParcelaNumero", "3094667545124-AD", extraction.ParcelaNumero);
            Console.WriteLine();
        }
        
        static void TestCase3_RawJsonFormat()
        {
            Console.WriteLine("Test 3: Real RawJson format from PaddleOCR");
            
            var rawJson = "[[[[0, 0], [1, 1], [1, 1], [0, 1]], ('CERTIFICACION IPI', 0.99)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('NO. DE CERTIFICACION', 0.98)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('CERT-2024-001234', 0.97)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('NO. INMUEBLE', 0.96)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('INM-456789', 0.95)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('PARCELA NO.', 0.94)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('3094667545124-AD', 0.93)]]";
            
            var ocrResult = new OcrResult
            {
                Success = true,
                Provider = "PaddleOcr",
                RawJson = rawJson,
                ExtractedText = ""
            };

            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            
            PrintExtraction(extraction);
            Console.WriteLine($"Status: {extraction.ExtractionStatus}");
            AssertField("NumeroCertificacion", "CERT-2024-001234", extraction.NumeroCertificacion);
            AssertField("NumeroInmueble", "INM-456789", extraction.NumeroInmueble);
            AssertField("ParcelaNumero", "3094667545124-AD", extraction.ParcelaNumero);
            Console.WriteLine();
        }
        
        static void TestCase4_AbbreviatedLabels()
        {
            Console.WriteLine("Test 4: Abbreviated labels (common OCR misreads)");
            
            var lines = new List<OcrLine>
            {
                new OcrLine { Text = "CERTIFICACION IPI" },
                new OcrLine { Text = "CERT. NO." },
                new OcrLine { Text = "CERT-2024-001234" },
                new OcrLine { Text = "NO. INM." },
                new OcrLine { Text = "INM-456789" },
                new OcrLine { Text = "PARCELA NO." },
                new OcrLine { Text = "3094667545124-AD" }
            };

            var ocrResult = new OcrResult
            {
                Success = true,
                Lines = lines,
                ExtractedText = string.Join(" ", lines.Select(l => l.Text))
            };

            var extraction = CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
            
            PrintExtraction(extraction);
            Console.WriteLine($"Status: {extraction.ExtractionStatus}");
            AssertField("NumeroCertificacion", "CERT-2024-001234", extraction.NumeroCertificacion);
            AssertField("NumeroInmueble", "INM-456789", extraction.NumeroInmueble);
            AssertField("ParcelaNumero", "3094667545124-AD", extraction.ParcelaNumero);
            Console.WriteLine();
        }
        
        static void PrintExtraction(CertificacionIPIRdExtractionV1 extraction)
        {
            Console.WriteLine($"  No. Certificacion: '{extraction.NumeroCertificacion.RawValue}' (Status: {extraction.NumeroCertificacion.Status})");
            Console.WriteLine($"  No. Inmueble: '{extraction.NumeroInmueble.RawValue}' (Status: {extraction.NumeroInmueble.Status})");
            Console.WriteLine($"  Parcela No.: '{extraction.ParcelaNumero.RawValue}' (Status: {extraction.ParcelaNumero.Status})");
            if (extraction.Warnings.Any())
            {
                Console.WriteLine($"  Warnings: {string.Join(", ", extraction.Warnings)}");
            }
        }
        
        static void AssertField(string name, string expected, ExtractedField field)
        {
            if (field.RawValue == expected && field.Status == FieldStatus.Valid)
            {
                Console.WriteLine($"  ✓ {name}: PASS");
            }
            else
            {
                Console.WriteLine($"  ✗ {name}: FAIL - Expected '{expected}', got '{field.RawValue}' (Status: {field.Status})");
            }
        }
    }
}