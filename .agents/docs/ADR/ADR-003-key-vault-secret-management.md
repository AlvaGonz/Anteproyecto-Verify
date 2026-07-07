# ADR-003: Azure Key Vault as Sole Secret Store (Zero Secrets in Code)

**Date:** 2026-05-25
**Status:** Accepted
**Supersedes:** N/A
**Referenced in:** `TRD_VeriFinca.md §5` · `ARCHITECTURE.md §2`

---

## Context

VeriFinca handles credentials for 5 external APIs, a JWT signing secret, RSA-2048 signing keys for legal digital seals (Law 126-02 Art. 32), and database connection strings. These are high-value secrets: a leaked `verifinca-rsa-private-key` would allow forging integrity seals for any property on the platform — a direct legal and reputational catastrophe.

Common patterns evaluated:

| Pattern | Reason Rejected |
|---|---|
| **Environment variables / `.env` files** | Rejected. Leaked in Docker image layers, CI logs, and process listings. No rotation capability. No audit log. |
| **`appsettings.json` / `appsettings.Production.json`** | Rejected. Files are committed to source control by mistake frequently. GitHub Advanced Security secret scan is a last resort, not a primary defense. |
| **AWS Secrets Manager** | Rejected. Cross-cloud dependency. Inconsistent with Azure Managed Identity auth model already required for Blob, Service Bus, and Document Intelligence. |
| **HashiCorp Vault (self-hosted)** | Rejected. Requires VeriFinca team to operate a secrets management cluster — operational overhead disproportionate to project phase. |
| **Azure Key Vault** | **Accepted.** Native Azure integration, zero credential bootstrapping via Managed Identity, hardware-backed HSM option available, full audit log in Azure Monitor, secret versioning and rotation built-in. |

---

## Decision

**Azure Key Vault Standard tier** is the sole store for all secrets, keys, and certificates. Zero secrets are permitted in environment variables, `appsettings.json`, Docker images, source code, CI/CD pipeline variables, or README files.

**Access pattern:** `Azure.Security.KeyVault.Secrets` SDK authenticated via **Azure Managed Identity** (no client secret or certificate required on the compute side). Secrets are loaded at application startup via `AddAzureKeyVault()` in `Program.cs` and cached in `IMemoryCache` with a **5-minute TTL** to limit Key Vault API call rate while bounding the window for a rotated secret to take effect.

**RSA-2048 key operations** (seal signing) are performed **inside Key Vault** using the `CryptographyClient`. The private key never leaves the Key Vault HSM boundary — only the signature output is returned to the application.

The full secret inventory (9 secrets) is defined in `TRD_VeriFinca.md §5`.

---

## Consequences

**Positive:**
- Private key for legal digital seals never exists in application memory or on disk
- Full audit log of every secret access in Azure Monitor — required for Law 126-02 compliance evidence
- Secret rotation requires only a new Key Vault version — zero code deployment
- Managed Identity eliminates credential bootstrapping (no "secret to access the secret store" problem)
- GitHub Advanced Security secret scan in CI becomes a safety net, not the primary defense

**Negative:**
- Local development requires either a dev Key Vault instance or `dotnet user-secrets` for non-production values — developers cannot run the app with a plain `appsettings.json`
- 5-minute cache TTL means a rotated secret takes up to 5 minutes to propagate to all running instances

**Risks:**
- **Key Vault outage:** Azure Key Vault SLA is 99.9%. During an outage, the 5-minute cache provides a short buffer. If the cache expires during an outage, new requests that require secret access will fail with `503`. Mitigation: Application Insights alert on Key Vault dependency failure rate > 1% triggers ADMIN page.
- **Managed Identity misconfiguration on new deployments:** Mitigated by smoke test gate in CI/CD (`GET /health` calls Key Vault internally and reports `keyvault: fail` in the health response if Managed Identity is not configured correctly).
