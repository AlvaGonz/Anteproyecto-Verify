# VeriFinca — Government API Integrations

## Registro Inmobiliario (RI)

| Property | Value |
|----------|-------|
| Purpose | Query title validity, ownership, legal encumbrances |
| Protocol | REST/SOAP |
| Auth | API Key (Key Vault: `verifinca-ri-apikey`) |
| Retry | 3x exponential (2s/4s/8s with ±20% jitter) |
| Circuit Breaker | 5 consecutive failures → open 30s |
| Fallback | Manual doc upload + FALLBACK status |
| Idempotency | Redis key prefix: `ri:` — TTL 24h |

## Catastro Nacional

| Property | Value |
|----------|-------|
| Purpose | Cadastral data, land surveys, area/boundary validation |
| Protocol | REST |
| Auth | API Key (Key Vault) |
| Retry | 3x exponential |
| Fallback | Manual entry |
| Idempotency | Redis key prefix: `catastro:` — TTL 24h |

## DGII (Dirección General de Impuestos Internos)

| Property | Value |
|----------|-------|
| Purpose | Tax compliance, RNC verification |
| Protocol | REST (public API) |
| Auth | None (public) |
| Retry | 3x exponential |
| Cache | 48h if PASS |
| Idempotency | Redis key prefix: `dgii:` — TTL 48h |

## TransUnion DR

| Property | Value |
|----------|-------|
| Purpose | Credit profile, financial risk assessment |
| Protocol | REST/SOAP |
| Auth | API Key (Key Vault: `verifinca-transunion-apikey`) |
| Retry | 3x exponential |
| Circuit Breaker | 5 consecutive failures → open 30s |
| Fallback | Block + ADMIN alert |
| Idempotency | Redis key prefix: `transunion:` — TTL 24h |
| Consent Gate | Blocked unless active ConsentRecord exists |

## Azure AI Document Intelligence

| Property | Value |
|----------|-------|
| Purpose | OCR + field extraction on uploaded PDFs/images |
| SDK | `Azure.AI.DocumentAnalysis` v4+ |
| Auth | Key Vault secret `verifinca-docai-key` |
| Confidence Threshold | Fields < 0.85 → treated as absent |
| Models | Custom per document type; fallback to `prebuilt-document` |

## Key Integration Rules

1. All external calls must go through `HttpClientFactory` with Polly resilience
2. No dynamic URL construction from user input (SSRF guard)
3. API keys only from Key Vault — never from config or env vars
4. Every call must emit structured log: `{Source, DurationMs, Outcome}`
5. Idempotency keys required for all metered/paid APIs
6. Circuit breaker shared across all clients (isolated pools via bulkhead)
