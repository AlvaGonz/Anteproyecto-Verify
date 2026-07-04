using System;
using System.Reflection;
using Stripe;
using System.Linq;

class Program
{
    static void Main()
    {
        var props = typeof(SubscriptionItem).GetProperties();
        foreach (var p in props)
        {
            if (p.PropertyType == typeof(DateTime) || p.PropertyType == typeof(DateTime?))
                Console.WriteLine(p.Name);
        }
    }
}
