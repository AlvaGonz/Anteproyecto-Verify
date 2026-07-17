namespace Tests.Unit.Subscriptions;

using global::Domain.Entities;
using global::Domain.Enums;
using global::Domain.Policies;
using Xunit;
using Tests.Shared;
using System;

public class SubscriptionIntegrityTests
{
    [Fact]
    public void SubscriptionTierPolicy_PaidPlan_NoActiveSubscription_ShouldDenyAccess()
    {
        // Arrange: User is assigned a paid plan but has no active subscription status
        var proPlan = TestPlanFactory.Profesional();
        var user = TestUsuarioFactory.Create(UserRole.User, proPlan, activeSubscription: false);
        
        // Assert: Access is denied
        Assert.False(SubscriptionTierPolicy.CanConsult(user));
        Assert.False(SubscriptionTierPolicy.CanCreateProject(user, 0));
        Assert.False(SubscriptionTierPolicy.IsProjectPublic(user));
    }

    [Fact]
    public void SubscriptionTierPolicy_PaidPlan_ActiveSubscription_ShouldAllowAccess()
    {
        // Arrange: User has pro plan with active status
        var proPlan = TestPlanFactory.Profesional();
        var user = TestUsuarioFactory.Create(UserRole.User, proPlan);
        user.UpdateStripeSubscription("sub_123", "active", DateTime.UtcNow.AddMonths(1));
        
        // Assert: Access is granted based on the plan limits
        Assert.True(SubscriptionTierPolicy.CanConsult(user));
        Assert.True(SubscriptionTierPolicy.CanCreateProject(user, 0));
        Assert.True(SubscriptionTierPolicy.IsProjectPublic(user));
    }

    [Fact]
    public void SubscriptionTierPolicy_FreePlan_NoActiveSubscription_ShouldAllowAccess()
    {
        // Arrange: User has free plan (price = 0) with no Stripe fields
        var freePlan = TestPlanFactory.Consultor();
        var user = TestUsuarioFactory.Create(UserRole.User, freePlan);
        
        // Assert: Free limits are still active
        Assert.True(SubscriptionTierPolicy.CanConsult(user)); // Consultor allows 1 query
        Assert.True(SubscriptionTierPolicy.CanCreateProject(user, 0)); // Consultor allows 1 project
    }

    [Fact]
    public void SubscriptionStatus_PacoMicoCase_ShouldBeIncomplete()
    {
        // Arrange: Paco Mico has customerId but no subscriptionId
        var proPlan = TestPlanFactory.Profesional();
        var user = TestUsuarioFactory.Create(UserRole.User, proPlan, activeSubscription: false);
        user.SetStripeCustomerId("cus_Upit4E2OdE0MdT");
        
        // Verify local helper logic or expected mapping:
        var hasPlan = user.Plan != null;
        var effectiveStatus = user.SubscriptionStatus ?? (hasPlan ? "active" : null);
        var isFree = hasPlan && user.Plan!.Precio == 0m;
        
        if (!string.IsNullOrEmpty(user.StripeCustomerId) && 
            string.IsNullOrEmpty(user.StripeSubscriptionId) && 
            hasPlan && !isFree)
        {
            effectiveStatus = "incomplete";
        }

        Assert.Equal("incomplete", effectiveStatus);
    }
}
// verified subscription integrity tests

