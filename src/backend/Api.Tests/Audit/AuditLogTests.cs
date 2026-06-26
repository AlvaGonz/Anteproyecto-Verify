using System;
using System.Linq;
using System.Reflection;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Xunit;

namespace Api.Tests.Audit;

public class AuditLogTests
{
    [Fact]
    public void AuditoriaEntity_PropertiesAreImmutable()
    {
        // Arrange
        var type = typeof(Auditoria);
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

        // Act & Assert
        foreach (var prop in properties)
        {
            if (prop.DeclaringType == typeof(Domain.Common.EntityBase)) continue;

            // Allowed to have private/protected setters, but not public ones
            var setter = prop.GetSetMethod(nonPublic: false);
            
            // Si el setter es nulo, significa que no es publico (puede ser init, private, protected)
            Assert.Null(setter); 
        }
    }

    [Fact]
    public void IAuditoriaRepository_DoesNotExposeUpdateOrDelete()
    {
        // Arrange
        var type = typeof(IAuditoriaRepository);
        var methods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance);

        // Act & Assert
        var hasUpdate = methods.Any(m => m.Name.Contains("Update"));
        var hasDelete = methods.Any(m => m.Name.Contains("Delete") || m.Name.Contains("Remove"));

        Assert.False(hasUpdate, "IAuditoriaRepository should not expose Update methods to ensure immutability.");
        Assert.False(hasDelete, "IAuditoriaRepository should not expose Delete methods to ensure immutability.");
    }
}
