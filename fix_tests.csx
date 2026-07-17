using System;
using System.IO;
using System.Text.RegularExpressions;

string[] files = Directory.GetFiles(""tests/backend/UnitTests"", ""*.cs"", SearchOption.AllDirectories);
foreach (var file in files)
{
    string text = File.ReadAllText(file);
    
    // ProjectStatus mapping
    text = text.Replace(""ProjectStatus.Draft"", ""ProjectStatus.Creado"");
    text = text.Replace(""ProjectStatus.InReview"", ""ProjectStatus.Revision"");
    text = text.Replace(""ProjectStatus.Published"", ""ProjectStatus.Publicado"");
    text = text.Replace(""ProjectStatus.Approved"", ""ProjectStatus.Publicado"");

    // UpdateStatus removal/fix
    text = Regex.Replace(text, @""\w+\.UpdateStatus\([^)]+\);"[\r\n]+"", """");
    
    // Replace EstadoProyecto with EstatusDescripcion in tests if checking Proyecto directly
    text = text.Replace(""EstadoProyecto"", ""EstatusDescripcion"");
    
    // Fix ProjectsController signature
    text = text.Replace(""new ProjectsController(_projectServiceMock.Object, _usuarioRepositoryMock.Object, _blobStorageServiceMock.Object)"", ""new ProjectsController(_projectServiceMock.Object, _usuarioRepositoryMock.Object, _blobStorageServiceMock.Object, new Moq.Mock<global::Application.Contracts.Documents.IDocumentService>().Object)"");
    
    File.WriteAllText(file, text);
}
