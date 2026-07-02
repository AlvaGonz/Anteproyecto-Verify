using System;
using Stripe;
using System.Linq;

class Program
{
    static void Main()
    {
        var props = typeof(Invoice).GetProperties().Select(p => p.Name).ToList();
        Console.WriteLine(string.Join(", ", props));
    }
}
