using System;
using System.IO;
using System.Linq;
using Microsoft.Data.SqlClient;

var connectionString = "Server=localhost\\SQLEXPRESS;Database=VeriFincaDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=True";
using var connection = new SqlConnection(connectionString);
connection.Open();

// The E2E test creates projects named "OCR Test Mensura mensura_fixture_a"
using var command = new SqlCommand("SELECT TOP 1 d.ResultadoOcrJson FROM Documents d JOIN Projects p ON d.ProyectoId = p.Id WHERE p.Nombre LIKE '%mensura_fixture_a%' ORDER BY d.CreatedAt DESC", connection);
var result = command.ExecuteScalar()?.ToString();

File.WriteAllText("ocr_fixture_a.json", result ?? "No result found.");
Console.WriteLine("Done.");
