namespace Domain.Entities;

using System;
using Domain.Common;

public class ProyectoGuardado : EntityBase
{
    public Guid ProjectId { get; private set; }
    public Proyecto Project { get; private set; } = null!;

    public Guid CreatorId { get; private set; }
    public Usuario Creator { get; private set; } = null!;

    public Guid SaverId { get; private set; }
    public Usuario Saver { get; private set; } = null!;

    protected ProyectoGuardado() { } // For EF Core

    public ProyectoGuardado(Guid projectId, Guid creatorId, Guid saverId)
    {
        ProjectId = projectId;
        CreatorId = creatorId;
        SaverId = saverId;
        CreatedAtUtc = DateTime.UtcNow;
    }
}
