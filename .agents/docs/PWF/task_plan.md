# Debug Session

## Bug Report
**ERROR / SÍNTOMA:** 
`CheckoutReturnPage.tsx:49 GET http://localhost:5000/api/v1/subscriptions/session-status?sessionId=... 400 (Bad Request)`

**ARCHIVO DONDE OCURRE:** 
`src/backend/Api/Controllers/SubscriptionController.cs` at `GetSessionStatus`

**ROOT CAUSE (Diagnosed):**
Stripe API key is empty (`""`) in `appsettings.Development.json`. `SubscriptionController` sets `StripeConfiguration.ApiKey` to `""`. When `SessionService.GetAsync` is called, Stripe SDK throws an `ArgumentException` ("API key cannot be empty"). `GlobalExceptionHandler` intercepts this `ArgumentException` and maps it to a `400 Bad Request`.

## Plan
[x] 1. Apply TDD as per `.agents/skills/test-driven-development/SKILL.md`. First, we need to create/fix a test in `src/backend/Api.Tests/Controllers/SubscriptionControllerTests.cs` that verifies this behavior.
[x] 2. Fix the controller to return a clearer 500 error when Stripe Secret Key is missing, similar to what `CreateSession` does. This ensures it doesn't get masked as a 400 Bad Request by the global exception handler.
[x] 3. Implement the fix in `SubscriptionController.cs`.
[x] 4. Run tests to confirm it passes.

## Resolution
The issue was that `SessionService.GetAsync()` throws an `ArgumentException` directly when `StripeConfiguration.ApiKey` is null/empty. This bypassed the `catch (StripeException e)` block entirely. The `GlobalExceptionHandler` then intercepted the `ArgumentException` and mapped it to a `400 Bad Request`.
We added an explicit configuration check at the beginning of `GetSessionStatus` to return a `500 Internal Server Error`, bypassing Stripe SDK entirely when the configuration is missing. The TDD tests confirm it works as expected.
