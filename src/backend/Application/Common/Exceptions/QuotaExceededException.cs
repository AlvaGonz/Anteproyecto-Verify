namespace Application.Common.Exceptions;

using System;

public class QuotaExceededException : Exception
{
    public string TierName { get; }
    public string LimitType { get; }

    public QuotaExceededException(string tierName, string limitType, string message) 
        : base(message)
    {
        TierName = tierName;
        LimitType = limitType;
    }
}
