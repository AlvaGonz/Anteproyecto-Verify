using System;
using Stripe;

namespace PropChecker
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine(typeof(Subscription).GetProperty("CurrentPeriodEnd") != null);
            Console.WriteLine(typeof(SubscriptionItem).GetProperty("CurrentPeriodEnd") != null);
            Console.WriteLine(typeof(Subscription).GetProperty("CurrentPeriodEnd")?.PropertyType.Name);
        }
    }
}
