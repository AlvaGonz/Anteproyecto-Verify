using System;
using System.IO;
using Microsoft.Data.SqlClient;

class Program
{
    static void Main()
    {
        var connectionString = "Server=localhost\\SQLEXPRESS;Database=VeriFincaDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=True";
        using var connection = new SqlConnection(connectionString);
        connection.Open();

        using var command = new SqlCommand("SELECT TOP 1 ResultadoOcrJson FROM Documents WHERE Id = '2a6d4dc5-3820-064f-4c6a-ff8ca94f391c'", connection);
        var result = command.ExecuteScalar()?.ToString();

        File.WriteAllText("ocr_result.json", result ?? "No result found.");
        Console.WriteLine("Done.");
    }
}
