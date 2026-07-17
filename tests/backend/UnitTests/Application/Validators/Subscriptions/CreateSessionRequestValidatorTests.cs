using System;
using Application.DTOs.Subscriptions;
using Application.Validators.Subscriptions;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using FluentValidation.TestHelper;

namespace UnitTests.Application.Validators.Subscriptions;

public class CreateSessionRequestValidatorTests
{
    private readonly CreateSessionRequestValidator _validator;

    public CreateSessionRequestValidatorTests()
    {
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["Stripe:Prices:ProfesionalMonthly"]).Returns("price_pro_mo");
        configMock.Setup(c => c["Stripe:Prices:ProfesionalAnual"]).Returns("price_pro_yr");
        
        _validator = new CreateSessionRequestValidator(configMock.Object);
    }

    [Fact]
    public void Validator_ShouldHaveError_WhenPriceIdIsEmpty()
    {
        var request = new CreateSessionRequest(string.Empty, null, null, new SubscriptionConsentDto(DateTime.UtcNow, "Mozilla"));
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.PriceId);
    }

    [Fact]
    public void Validator_ShouldHaveError_WhenPriceIdIsInvalid()
    {
        var request = new CreateSessionRequest("invalid_price", null, null, new SubscriptionConsentDto(DateTime.UtcNow, "Mozilla"));
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.PriceId)
              .WithErrorMessage("El PriceId proporcionado no es válido.");
    }

    [Fact]
    public void Validator_ShouldNotHaveError_WhenRequestIsValid()
    {
        var request = new CreateSessionRequest("price_pro_mo", null, null, new SubscriptionConsentDto(DateTime.UtcNow, "Mozilla"));
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validator_ShouldHaveError_WhenConsentIsNull()
    {
        var request = new CreateSessionRequest("price_pro_mo", null, null, null!);
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Consent)
              .WithErrorMessage("El consentimiento es requerido.");
    }

    [Fact]
    public void Validator_ShouldHaveError_WhenConsentTimestampIsNull()
    {
        var request = new CreateSessionRequest("price_pro_mo", null, null, new SubscriptionConsentDto(null, "Mozilla"));
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Consent.Timestamp);
    }

    [Fact]
    public void Validator_ShouldHaveError_WhenConsentUserAgentIsEmpty()
    {
        var request = new CreateSessionRequest("price_pro_mo", null, null, new SubscriptionConsentDto(DateTime.UtcNow, ""));
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Consent.UserAgent);
    }
}

