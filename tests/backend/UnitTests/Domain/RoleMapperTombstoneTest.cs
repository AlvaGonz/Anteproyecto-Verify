namespace Tests.Unit.Domain;

using System;
using System.Linq;
using Xunit;

public class RoleMapperTombstoneTest
{
    [Fact]
    public void MapProfileNameToRole_ShouldNotExistInSolution()
    {
        // This is an architecture test, NOT a reflection test.
        // Use a simple type scan across loaded assemblies:

        var allTypes = AppDomain.CurrentDomain.GetAssemblies()
            // Try to focus only on our own assemblies to avoid massive sweeps if possible,
            // but getting all types is fine for a unit test.
            .Where(a => a.FullName?.StartsWith("Domain") == true || a.FullName?.StartsWith("Application") == true || a.FullName?.StartsWith("Api") == true || a.FullName?.StartsWith("Infrastructure") == true)
            .SelectMany(a => {
                try {
                    return a.GetTypes();
                } catch {
                    return Array.Empty<Type>();
                }
            });

        var hasMapMethod = allTypes
            .SelectMany(t => t.GetMethods(
                System.Reflection.BindingFlags.Public |
                System.Reflection.BindingFlags.Static))
            .Any(m => m.Name == "MapProfileNameToRole");

        Assert.False(hasMapMethod,
            "MapProfileNameToRole must be deleted. " +
            "Found it still compiled in the assembly.");
    }
}

