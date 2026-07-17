namespace Tests.Unit.Domain;

using Domain.Enums;
using Domain.Policies;
using Xunit;

public class ProjectLifecyclePolicyTests
{
    [Theory]
    [InlineData(ProjectStatusCodes.Creado, 1, true)]
    [InlineData(ProjectStatusCodes.Editado, 2, true)]
    [InlineData(null, 1, true)]
    [InlineData(ProjectStatusCodes.Creado, 0, false)]
    [InlineData(ProjectStatusCodes.Revision, 5, false)]
    [InlineData(ProjectStatusCodes.Publicado, 3, false)]
    [InlineData(ProjectStatusCodes.Observacion, 1, false)]
    public void ShouldEnterReview_MatchesDocumentThresholdAndEarlyStatus(
        string? codigo,
        int documentCount,
        bool expected)
    {
        Assert.Equal(expected, ProjectLifecyclePolicy.ShouldEnterReview(codigo, documentCount));
    }
}
