using System;
using System.Data.SqlClient;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        string connectionString = @"Server=localhost\SQLEXPRESS;Database=VeriFincaDb;Integrated Security=True;TrustServerCertificate=True;";
        
        string consultorId = "8EECEFD7-2474-4E86-A01F-BB8E80322610".ToLower();
        string profesionalId = "0545DAAD-6B46-4AE9-8FCD-5D6F87846F55".ToLower();
        string empresaId = "4DE35F9B-4E94-4C6B-A704-DC496B98997F".ToLower();
        string corporativoId = "F853C4F0-EF4A-4AB1-8065-2E3EB1092865".ToLower();
        string adminId = "2EA184A5-70ED-49D6-AC20-9DA492A711FA".ToLower();

        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                Console.WriteLine("Connected to DB.");

                // Get statuses
                var statuses = new Dictionary<string, string>();
                using (var cmd = new SqlCommand("SELECT CodigoUnico, Id FROM ProyectosEstados", conn))
                {
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            statuses[reader.GetString(0)] = reader.GetGuid(1).ToString().ToLower();
                        }
                    }
                }
                
                string publicadoId = statuses.ContainsKey("PUBLICADO") ? statuses["PUBLICADO"] : "";

                // Consultor
                using (var cmd = new SqlCommand($"SELECT IdProyecto, EstadoId FROM ProyectosInmobiliarios WHERE IdUsuario = '{consultorId}'", conn))
                {
                    var projects = new List<Tuple<string, string>>();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read()) projects.Add(Tuple.Create(reader.GetGuid(0).ToString(), reader.GetGuid(1).ToString().ToLower()));
                    }

                    bool keptConsultor = false;
                    foreach (var p in projects)
                    {
                        if (p.Item2 == publicadoId && !keptConsultor)
                        {
                            keptConsultor = true;
                        }
                        else
                        {
                            UpdateUser(conn, p.Item1, corporativoId);
                        }
                    }

                    if (!keptConsultor && projects.Count > 0)
                    {
                        UpdateUser(conn, projects[0].Item1, consultorId); // keep at least one if none are published
                        for (int i = 1; i < projects.Count; i++) UpdateUser(conn, projects[i].Item1, corporativoId);
                    }
                }

                // Profesional
                using (var cmd = new SqlCommand($"SELECT IdProyecto, EstadoId FROM ProyectosInmobiliarios WHERE IdUsuario = '{profesionalId}'", conn))
                {
                    var projects = new List<Tuple<string, string>>();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read()) projects.Add(Tuple.Create(reader.GetGuid(0).ToString(), reader.GetGuid(1).ToString().ToLower()));
                    }

                    var keptStatuses = new HashSet<string>();
                    foreach (var p in projects)
                    {
                        if (keptStatuses.Count < 5 && !keptStatuses.Contains(p.Item2))
                        {
                            keptStatuses.Add(p.Item2);
                        }
                        else
                        {
                            UpdateUser(conn, p.Item1, corporativoId);
                        }
                    }
                }

                // Empresa
                var interested = new HashSet<string>();
                using (var cmd = new SqlCommand($"SELECT ProjectId FROM ProyectoInteres WHERE InterestedUserId = '{adminId}'", conn))
                {
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read()) interested.Add(reader.GetGuid(0).ToString().ToLower());
                    }
                }

                using (var cmd = new SqlCommand($"SELECT IdProyecto FROM ProyectosInmobiliarios WHERE IdUsuario = '{empresaId}'", conn))
                {
                    var projects = new List<string>();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read()) projects.Add(reader.GetGuid(0).ToString().ToLower());
                    }

                    var keptEmpresa = new List<string>();
                    foreach (var pid in projects)
                    {
                        if (interested.Contains(pid) && keptEmpresa.Count < 10) keptEmpresa.Add(pid);
                    }

                    foreach (var pid in projects)
                    {
                        if (!keptEmpresa.Contains(pid) && keptEmpresa.Count < 10) keptEmpresa.Add(pid);
                    }

                    foreach (var pid in projects)
                    {
                        if (!keptEmpresa.Contains(pid))
                        {
                            UpdateUser(conn, pid, corporativoId);
                        }
                    }
                }
                
                Console.WriteLine("DB update complete.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.ToString());
        }
    }

    static void UpdateUser(SqlConnection conn, string projectId, string newUserId)
    {
        using (var cmd = new SqlCommand($"UPDATE ProyectosInmobiliarios SET IdUsuario = '{newUserId}' WHERE IdProyecto = '{projectId}'", conn))
        {
            cmd.ExecuteNonQuery();
        }
    }
}
