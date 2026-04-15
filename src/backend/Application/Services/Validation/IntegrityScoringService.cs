namespace Application.Services.Validation;

using System;
using System.Collections.Generic;
using System.Linq;
using Application.DTOs.Validation;
using Domain.Entities;
using Domain.Enums;

public interface IIntegrityScoringService
{
    double CalculateScore(IEnumerable<ValidationRuleResultDto> internalResults, IEnumerable<ValidationSourceResult> externalResults);
    SelloIntegridad? DetermineSello(Guid projectId, double score, bool hasCriticalFindings);
}

public class IntegrityScoringService : IIntegrityScoringService
{
    public double CalculateScore(IEnumerable<ValidationRuleResultDto> internalResults, IEnumerable<ValidationSourceResult> externalResults)
    {
        double totalWeight = 0;
        double earnedWeight = 0;

        // Internal Rules (40% weight total)
        var internalRules = internalResults.ToList();
        if (internalRules.Any())
        {
            double internalBase = 40.0;
            double weightPerRule = internalBase / internalRules.Count;
            
            foreach (var rule in internalRules)
            {
                totalWeight += weightPerRule;
                if (rule.Status == RuleStatus.Passed)
                    earnedWeight += weightPerRule;
                else if (rule.Status == RuleStatus.Warning)
                    earnedWeight += weightPerRule * 0.5;
            }
        }

        // External Sources (60% weight total)
        var externalSources = externalResults.ToList();
        if (externalSources.Any())
        {
            double externalBase = 60.0;
            double weightPerSource = externalBase / externalSources.Count;

            foreach (var source in externalSources)
            {
                totalWeight += weightPerSource;
                if (source.IsMatch)
                    earnedWeight += weightPerSource;
                else if (source.Status == "Inconsistent")
                    earnedWeight += weightPerSource * 0.3;
            }
        }

        if (totalWeight == 0) return 0;
        return Math.Round((earnedWeight / totalWeight) * 100, 2);
    }

    public SelloIntegridad? DetermineSello(Guid projectId, double score, bool hasCriticalFindings)
    {
        if (hasCriticalFindings || score < 70) return null;

        string nombreSello;
        NivelSelloIntegridad nivel;

        if (score >= 95)
        {
            nombreSello = "Sello Diamante";
            nivel = NivelSelloIntegridad.Diamante;
        }
        else if (score >= 85)
        {
            nombreSello = "Sello Oro";
            nivel = NivelSelloIntegridad.Oro;
        }
        else if (score >= 75)
        {
            nombreSello = "Sello Plata";
            nivel = NivelSelloIntegridad.Plata;
        }
        else
        {
            nombreSello = "Sello Bronce";
            nivel = NivelSelloIntegridad.Bronce;
        }

        var codigo = $"AV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
        var urlQr = $"https://verify.anteproyecto.do/v/{codigo}";
        var firma = Guid.NewGuid().ToString("N");

        return new SelloIntegridad(projectId, codigo, nombreSello, nivel, urlQr, firma);
    }
}
